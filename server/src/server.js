const express = require('express');

const createDatabase = require('./database');

module.exports = function createServer() {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    const entryListCache = createDatabase();
    app.get('/health', restHandler(() => {
        return Promise.resolve('');
    }))
    app.get('/entries', restHandler(() => {
        log('GET /entries', { properties: null, content: null, entryListCache: entryListCache.toString() });
        return entryListCache.getList();
    }));
    app.post('/entries', restHandler((properties, content) => {
        log('POST /entries', { properties, content, entryListCache: entryListCache.toString() });
        if (!content) {
            throw new Error('EMPTY');
        }
        return entryListCache.push(content).then(() => {
            return null;
        });
    }));
    app.get('/entries/:id', restHandler((properties) => {
        log('GET /entries/:id', { properties, content: null, entryListCache: entryListCache.toString() });
        return entryListCache.find((entry) => {
            return entry && properties && entry.id === properties.id;
        });
    }));
    app.put('/entries/:id', restHandler((properties, content) => {
        log('PUT /entries/:id', { properties, content, entryListCache: entryListCache.toString() });
        if (!content) {
            throw new Error('EMPTY');
        }
        return entryListCache.findIndex((entry) => {
            return entry && properties && entry.id === properties.id;
        }).then((indexEntry) => {
            log('LIST INDEX', indexEntry);
            if (indexEntry === -1) {
                return undefined;
            }
            return entryListCache.set(indexEntry, content).then(() => {
                return content;
            });
        });
    }));
    app.delete('/entries/:id', restHandler((properties, content) => {
        log('DELETE /entries/:id', { properties, content, entryListCache: entryListCache.toString() });
        return entryListCache.findIndex((entry) => {
            return entry && properties && entry.id === properties.id;
        }).then((indexEntry) => {
            if (indexEntry === -1) {
                return undefined;
            }
            return entryListCache.splice(indexEntry, 1).then(() => {
                return null;
            });
        });
    }));
    return app;
}

function restHandler(handler) {
    return (req, res) => {
        log('REST HANDLER', { url: req && req.url, method: req && req.method }, req);
        const params = req && req.params;
        let content = req && req.body;
        log('REST CONTENT', { params, content }, req);
        try {
            if (content && typeof content === 'string') {
                content = JSON.parse(content);
            }
        } catch (e) {
            console.error(e);
            res.status(400);
            return Promise.resolve();
        }
        log('CALL HANDLER', undefined, req);
        try {
            const resultPromise = handler(params, content);
            return resultPromise.then((result) => {
                log('REST RESULT', result, req);
                if (res) {
                    if (result !== null && result !== undefined) {
                        log('REST STATUS', 200, req);
                        res.status(200);
                    } else if (result === null) {
                        log('REST STATUS', 201, req);
                        res.status(201);
                    } else {
                        log('REST STATUS', 404, req);
                        res.status(404);
                    }
                    res.send(result);
                }
            });
        } catch (e) {
            console.error(e);
            if (e.message === 'EMPTY') {
                if (res) {
                    res.send(undefined);
                    res.status(400);
                }
            }
            return Promise.resolve();
        }
    };
}

function log(message, object, req) {
    if (req && req.url === '/health') {
        return;
    }
    console.log(message, object);
}
