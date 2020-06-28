/* eslint-disable padded-blocks */
'use strict';

// ******* imports **********
const rewiremock = require('rewiremock/node');
const { stub } = require('sinon');
const __ = require('hamjest');
require('hamjest-sinon');

// ******* mocks *********
const expressMock = {
    get: stub(),
    post: stub(),
    put: stub(),
    delete: stub(),
    listen: stub(),
    use: stub(),
};
const expressCreatorMock = stub();
expressCreatorMock.json = stub();
expressCreatorMock.urlencoded = stub();
rewiremock(() => require('express')).with(expressCreatorMock);

function createFakeDatabase() {
    const cache = [];
    return {
        getList: () => Promise.resolve(cache),
        push: (entry) => Promise.resolve(cache.push(entry)),
        find: (callback) => Promise.resolve(cache.find(callback)),
        findIndex: (callback) => Promise.resolve(cache.findIndex(callback)),
        splice: (index, length) => Promise.resolve(cache.splice(index, length)),
        set: (index, item) => Promise.resolve(cache[index] = item),
        toString: () => cache,
    }
}
rewiremock(() => require('./database')).with(createFakeDatabase);

// ********* wire mocks **********
rewiremock.enable();
const createServer = require('./server');
rewiremock.disable();

describe('createServer', () => {
    beforeEach(() => {
      expressMock.get.reset();
      expressMock.post.reset();
      expressMock.put.reset();
      expressMock.delete.reset();
      expressMock.listen.reset();
      expressMock.listen.returns({ setTimeout: stub() });
      expressMock.use.reset();
      expressCreatorMock.reset();
      expressCreatorMock.returns(expressMock);
      expressCreatorMock.json.reset();
      expressCreatorMock.json.returns('json enabled');
      expressCreatorMock.urlencoded.reset();
      expressCreatorMock.urlencoded.returns('url encoded enabled');
    });

    it('should be a function', () => {
        
        __.assertThat(createServer, __.is(__.func()));
    });

    describe('when called', () => {
        let server;
        beforeEach(() => {
            server = createServer();
        });

        it('should return an app', () => {
    
            __.assertThat(server, __.is(expressMock));
        });
    
        it('should setup using json', () => {
    
            __.assertThat(expressCreatorMock, __.hasProperty('json', __.wasCalled()));
            __.assertThat(expressMock, __.hasProperty('use', __.wasCalledWith('json enabled')));
        });
    
        it('should setup urlencoding', () => {
    
            __.assertThat(expressCreatorMock, __.hasProperty('urlencoded', __.wasCalledWith({ extended: true })));
            __.assertThat(expressMock, __.hasProperty('use', __.wasCalledWith('url encoded enabled')));
        });

        describe('GET /entries', () => {
            it('should be an added handler', () => {

                __.assertThat(expressMock, __.hasProperty('get', __.wasCalledWith('/entries', __.func())));
            });

            describe('url handler', () => {
                let urlHandler;
                beforeEach(() => {
                    urlHandler = expressMock.get.args.find((callArgs) => callArgs[0] === '/entries')[1];
                });

                it('should be a function', () => {

                    __.assertThat(urlHandler, __.is(__.func()));
                });

                it('should return a promise', () => {

                    const result = urlHandler();

                    __.assertThat(result, __.is(__.instanceOf(Promise)));
                });

                it('should send a list of entries to response', () => {
                    const response = { send: stub(), status: stub() };

                    const result = urlHandler(null, response);

                    return result.then(() => {
                        __.assertThat(response, __.hasProperties({
                            send: __.wasCalledWith(__.hasSize(0)),
                            status: __.wasCalledWith(200),
                        }));
                    });
                });
            });
        });

        describe('GET /entries/:id', () => {
            it('should be an added handler', () => {

                __.assertThat(expressMock, __.hasProperty('get', __.wasCalledWith('/entries/:id', __.func())));
            });

            describe('url handler', () => {
                let urlHandler;
                beforeEach(() => {
                    urlHandler = expressMock.get.args.find((callArgs) => callArgs[0] === '/entries/:id')[1];
                });

                it('should be a function', () => {

                    __.assertThat(urlHandler, __.is(__.func()));
                });

                it('should return a promise', () => {

                    const result = urlHandler();

                    __.assertThat(result, __.is(__.instanceOf(Promise)));
                });

                it('should send 404 to response', () => {
                    const response = { send: stub(), status: stub() };

                    const result = urlHandler(null, response);

                    return result.then(() => {
                        __.assertThat(response, __.hasProperties({
                            send: __.wasCalledWith(undefined),
                            status: __.wasCalledWith(404),
                        }));
                    });
                });
            });
        });

        describe('PUT /entries/:id', () => {
            it('should be an added handler', () => {

                __.assertThat(expressMock, __.hasProperty('put', __.wasCalledWith('/entries/:id', __.func())));
            });

            describe('url handler', () => {
                let urlHandler;
                beforeEach(() => {
                    urlHandler = expressMock.put.args.find((callArgs) => callArgs[0] === '/entries/:id')[1];
                });

                it('should be a function', () => {

                    __.assertThat(urlHandler, __.is(__.func()));
                });

                it('should return a promise', () => {

                    const result = urlHandler();

                    __.assertThat(result, __.is(__.instanceOf(Promise)));
                });

                it('should send 400 to response with empty content', () => {
                    const request = { params: { id: '1234' }, body: null }
                    const response = { send: stub(), status: stub() };

                    const result = urlHandler(request, response);

                    return result.then(() => {
                        __.assertThat(response, __.hasProperties({
                            send: __.wasCalledWith(undefined),
                            status: __.wasCalledWith(400),
                        }));
                    });
                });

                it('should send 404 to response', () => {
                    const request = { params: { id: '1234' }, body: { id: '2345' } }
                    const response = { send: stub(), status: stub() };

                    const result = urlHandler(request, response);

                    return result.then(() => {
                        __.assertThat(response, __.hasProperties({
                            send: __.wasCalledWith(undefined),
                            status: __.wasCalledWith(404),
                        }));
                    });
                });
            });
        });

        describe('DELETE /entries/:id', () => {
            it('should be an added handler', () => {

                __.assertThat(expressMock, __.hasProperty('delete', __.wasCalledWith('/entries/:id', __.func())));
            });

            describe('url handler', () => {
                let urlHandler;
                beforeEach(() => {
                    urlHandler = expressMock.delete.args.find((callArgs) => callArgs[0] === '/entries/:id')[1];
                });

                it('should be a function', () => {

                    __.assertThat(urlHandler, __.is(__.func()));
                });

                it('should return a promise', () => {

                    const result = urlHandler();

                    __.assertThat(result, __.is(__.instanceOf(Promise)));
                });

                it('should send 404 to response', () => {
                    const response = { send: stub(), status: stub() };

                    const result = urlHandler(null, response);

                    return result.then(() => {
                        __.assertThat(response, __.hasProperties({
                            send: __.wasCalledWith(undefined),
                            status: __.wasCalledWith(404),
                        }));
                    });
                });
            });
        });

        describe('POST /entries', () => {
            it('should be an added handler', () => {

                __.assertThat(expressMock, __.hasProperty('post', __.wasCalledWith('/entries', __.func())));
            });

            describe('url handler', () => {
                let urlHandler;
                beforeEach(() => {
                    urlHandler = expressMock.post.args.find((callArgs) => callArgs[0] === '/entries')[1];
                });

                it('should be a function', () => {

                    __.assertThat(urlHandler, __.is(__.func()));
                });

                it('should return a promise', () => {

                    const result = urlHandler();

                    __.assertThat(result, __.is(__.instanceOf(Promise)));
                });

                it('should send 400 to response for no content send', () => {
                    const response = { send: stub(), status: stub() };

                    const result = urlHandler(null, response);

                    return result.then(() => {
                        __.assertThat(response, __.hasProperties({
                            send: __.wasCalledWith(undefined),
                            status: __.wasCalledWith(400),
                        }));
                    });
                });

                it('should send 201 to response for content send', () => {
                    const request = { params: {}, body: '{}' };
                    const response = { send: stub(), status: stub() };

                    const result = urlHandler(request, response);

                    return result.then(() => {
                        __.assertThat(response, __.hasProperties({
                            send: __.wasCalledWith(null),
                            status: __.wasCalledWith(201),
                        }));
                    });
                });

                describe('successfully added an entry', () => {
                    beforeEach(() => {
                        const request = { params: {}, body: '{ "id": "1234" }' };
                        const response = { send: stub(), status: stub() };
    
                        return urlHandler(request, response);
                    });

                    it('should be an entry in the list GET', () => {
                        const response = { send: stub(), status: stub() };
                        const listHandler = expressMock.get.args.find((callArgs) => callArgs[0] === '/entries')[1];

                        const result = listHandler(null, response);

                        return result.then(() => {
                            __.assertThat(response, __.hasProperties({
                                send: __.wasCalledWith(__.contains(
                                    { id: '1234' }
                                )),
                                status: __.wasCalledWith(200),
                            }));
                        });
                    });

                    describe('and GET', () => {
                        let getHandler;
                        beforeEach(() => {
                            getHandler = expressMock.get.args.find((callArgs) => callArgs[0] === '/entries/:id')[1];
                        });

                        it('should be the entry', () => {
                            const response = { send: stub(), status: stub() };
        
                            const result = getHandler({ params: { id: '1234' }}, response);
        
                            return result.then(() => {
                                __.assertThat(response, __.hasProperties({
                                    send: __.wasCalledWith(
                                        { id: '1234' }
                                    ),
                                    status: __.wasCalledWith(200),
                                }));
                            });
                        });
    
                        it('should change the entry on the entry PUT', () => {
                            const response = { send: stub(), status: stub() };
                            const putHandler = expressMock.put.args.find((callArgs) => callArgs[0] === '/entries/:id')[1];
        
                            let result = putHandler({ params: { id: '1234' }, body: { id: '2345' } }, response);
        
                            return result.then(() => {
                                __.assertThat(response, __.hasProperties({
                                    send: __.wasCalledWith(
                                        { id: '2345' }
                                    ),
                                    status: __.wasCalledWith(200),
                                }));
        
                                result = getHandler({ params: { id: '2345' }}, response);
        
                                return result.then(() => {
                                    __.assertThat(response, __.hasProperties({
                                        send: __.wasCalledWith(
                                            { id: '2345' }
                                        ),
                                        status: __.wasCalledWith(200),
                                    }));
                                });
                            });
                        });
    
                        it('should delete the entry on the entry DELETE', () => {
                            const response = { send: stub(), status: stub() };
                            const deleteHandler = expressMock.delete.args.find((callArgs) => callArgs[0] === '/entries/:id')[1];
        
                            let result = deleteHandler({ params: { id: '1234' } }, response);
        
                            return result.then(() => {
                                __.assertThat(response, __.hasProperties({
                                    send: __.wasCalledWith(null),
                                    status: __.wasCalledWith(201),
                                }));
        
                                result = getHandler({ params: { id: '1234' }}, response);
        
                                return result.then(() => {
                                    __.assertThat(response, __.hasProperties({
                                        send: __.wasCalledWith(undefined),
                                        status: __.wasCalledWith(404),
                                    }));
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});