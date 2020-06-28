const express = require('express');

const createDatabase = require('./database');

module.exports = function createServer() {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    const entryListCache = createDatabase();
    app.get('/entries', restHandler(() => {
        console.log('GET /entries', { properties: null, content: null, entryListCache: entryListCache.toString() });
        return entryListCache.getList();
    }));
    app.post('/entries', restHandler((properties, content) => {
        console.log('POST /entries', { properties, content, entryListCache: entryListCache.toString() });
        if (!content) {
            throw new Error('EMPTY');
        }
        return entryListCache.push(content).then(() => {
            return null;
        });
    }));
    app.get('/entries/:id', restHandler((properties) => {
        console.log('GET /entries/:id', { properties, content: null, entryListCache: entryListCache.toString() });
        return entryListCache.find((entry) => {
            return entry && properties && entry.id === properties.id;
        });
    }));
    app.put('/entries/:id', restHandler((properties, content) => {
        console.log('PUT /entries/:id', { properties, content, entryListCache: entryListCache.toString() });
        if (!content) {
            throw new Error('EMPTY');
        }
        return entryListCache.findIndex((entry) => {
            return entry && properties && entry.id === properties.id;
        }).then((indexEntry) => {
            console.log('LIST INDEX', indexEntry);
            if (indexEntry === -1) {
                return undefined;
            }
            return entryListCache.set(indexEntry, content).then(() => {
                return content;
            });
        });
    }));
    app.delete('/entries/:id', restHandler((properties, content) => {
        console.log('DELETE /entries/:id', { properties, content, entryListCache: entryListCache.toString() });
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
        console.log('REST HANDLER', { url: req && req.url, method: req && req.method });
        const params = req && req.params;
        let content = req && req.body;
        console.log('REST CONTENT', { params, content });
        try {
            if (content && typeof content === 'string') {
                content = JSON.parse(content);
            }
        } catch (e) {
            console.error(e);
            res.status(400);
            return Promise.resolve();
        }
        console.log('CALL HANDLER');
        try {
            const resultPromise = handler(params, content);
            return resultPromise.then((result) => {
                console.log('REST RESULT', result);
                if (res) {
                    if (result !== null && result !== undefined) {
                        console.log('REST STATUS', 200);
                        res.status(200);
                    } else if (result === null) {
                        console.log('REST STATUS', 201);
                        res.status(201);
                    } else {
                        console.log('REST STATUS', 404);
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
