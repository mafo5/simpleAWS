/* eslint-disable padded-blocks */
'use strict';

// ******* imports **********
const rewiremock = require('rewiremock/node');
const { stub } = require('sinon');
const __ = require('hamjest');
require('hamjest-sinon');

// ******* mocks *********
const MockMongoConnection = { db: stub(), close: stub() };
const MockMongoDB = { collection: stub(), createCollection: stub() };
const MockMongoCollection = { find: stub() };
const MockMongoClient = { connect: (url, callback) => {
    callback(null, MockMongoConnection);
}, };
rewiremock(() => require('mongodb')).with({ MongoClient: MockMongoClient });

// ********* wire mocks **********
rewiremock.enable();
const createDatabase = require('./database');
rewiremock.disable();

describe.only('createDatabase', () => {

    beforeEach(() => {
        // MockMongoClient.connect.reset();
        MockMongoConnection.db.reset();
        MockMongoDB.collection.reset();
        MockMongoConnection.db.returns(MockMongoDB);
        MockMongoDB.collection.returns(MockMongoCollection);
        MockMongoCollection.find.reset();
    });

    it('should be a function', () => {
        
        __.assertThat(createDatabase, __.is(__.func()));
    });

    describe('when called', () => {
        let database;
        beforeEach(() => {
            database = createDatabase();
        });

        it('should return a database handler', () => {
    
            __.assertThat(database, __.hasProperties({
                getList: __.func(),
                push: __.func(),
                find: __.func(),
                findIndex: __.func(),
                splice: __.func(),
                set: __.func(),
                toString: __.func(),
            }));
        });

        describe('getList', () => {
            let listReturns;
            beforeEach(() => {
                const toArray = stub();
                listReturns = (resultList) => {
                    toArray.args[0][0](null, resultList);
                };
                MockMongoCollection.find.returns({ toArray });
            });

            it('should result a promise', () => {

                const result = database.getList();

                __.assertThat(result, __.is(__.instanceOf(Promise)));
            });

            describe('called', () => {
                let result;
                beforeEach(() => {
                    result = database.getList();
                });

                it('should connect to db', () => {

                    __.assertThat(MockMongoConnection, __.hasProperty('db', __.wasCalledWith('simpleAWS')));
                });

                it('should resolve with the db result list', () => {
                    listReturns([{ id: '1234' }]);
    
                    return __.promiseThat(result, __.willBe(__.contains(
                        { id: '1234' }
                    )));
                });
            });
        });

        describe('push', () => {
            let createEntry;
            let insertOne;
            beforeEach(() => {
                insertOne = stub();
                createEntry = () => {
                    insertOne.args[0][1]();
                };
                MockMongoCollection.insertOne = insertOne;
            });

            it('should result a promise', () => {

                const result = database.push({ id: '2345' });

                __.assertThat(result, __.is(__.instanceOf(Promise)));
            });

            describe('called', () => {
                let result;
                beforeEach(() => {
                    result = database.push({ id: '2345' });
                });

                it('should connect to db', () => {

                    __.assertThat(MockMongoConnection, __.hasProperty('db', __.wasCalledWith('simpleAWS')));
                });

                it('should send entry to db', () => {
    
                    __.assertThat(insertOne, __.wasCalledWith({ id: '2345' }, __.func()));
                });

                it('should resolve with the given entry', () => {
                    createEntry();
    
                    return __.promiseThat(result, __.willBe(
                        { id: '2345' }
                    ));
                });
            });
        });

        describe('find', () => {
            let listReturns;
            beforeEach(() => {
                const toArray = stub();
                listReturns = (resultList) => {
                    toArray.args[0][0](null, resultList);
                };
                MockMongoCollection.find.returns({ toArray });
            });

            it('should result a promise', () => {

                const result = database.find((entry) => entry.id === '1234');

                __.assertThat(result, __.is(__.instanceOf(Promise)));
            });

            describe('called', () => {
                let result;
                beforeEach(() => {
                    result = database.find((entry) => entry.id === '1234');
                });

                it('should connect to db', () => {

                    __.assertThat(MockMongoConnection, __.hasProperty('db', __.wasCalledWith('simpleAWS')));
                });

                it('should resolve with the db result list', () => {
                    listReturns([{ id: '1234' }]);
    
                    return __.promiseThat(result, __.willBe(
                        { id: '1234' }
                    ));
                });
            });
        });

        describe('findIndex', () => {
            let listReturns;
            beforeEach(() => {
                const toArray = stub();
                listReturns = (resultList) => {
                    toArray.args[0][0](null, resultList);
                };
                MockMongoCollection.find.returns({ toArray });
            });

            it('should result a promise', () => {

                const result = database.findIndex((entry) => entry.id === '1234');

                __.assertThat(result, __.is(__.instanceOf(Promise)));
            });

            describe('called', () => {
                let result;
                beforeEach(() => {
                    result = database.findIndex((entry) => entry.id === '1234');
                });

                it('should connect to db', () => {

                    __.assertThat(MockMongoConnection, __.hasProperty('db', __.wasCalledWith('simpleAWS')));
                });

                it('should resolve with the db result list', () => {
                    listReturns([{ id: '1234' }]);
    
                    return __.promiseThat(result, __.willBe(
                        0
                    ));
                });
            });
        });

        describe('splice', () => {
            let listReturns;
            let deleteOne;
            beforeEach(() => {
                deleteOne = stub().callsFake((entry, callback) => callback());
                MockMongoCollection.deleteOne = deleteOne;
                listReturns = (resultList) => {
                    const toArray = stub().callsFake((callback) => callback(null, resultList));
                    MockMongoCollection.find.returns({ toArray });
                };
                listReturns([{ id: '1234' }]);
            });

            it('should result a promise', () => {

                const result = database.splice(0, 1);

                __.assertThat(result, __.is(__.instanceOf(Promise)));
            });

            describe('called', () => {
                let result;
                beforeEach(() => {
                    result = database.splice(0, 1);
                });

                it('should connect to db', () => {

                    __.assertThat(MockMongoConnection, __.hasProperty('db', __.wasCalledWith('simpleAWS')));
                });

                it('should send entry to db', () => {

                    return result.then(() => {
                        __.assertThat(deleteOne, __.wasCalledWith({ id: '1234' }, __.func()));
                    });
                });

                it('should resolve with the given entry', () => {
                    return result.then(() => {
    
                        return __.promiseThat(result, __.willBe([
                            undefined
                        ]));
                    });
                });
            });
        });

        describe('set', () => {
            let listReturns;
            let updateOne;
            beforeEach(() => {
                updateOne = stub().callsFake((oldEntry, newEntry, callback) => callback());
                MockMongoCollection.updateOne = updateOne;
                listReturns = (resultList) => {
                    const toArray = stub().callsFake((callback) => callback(null, resultList));
                    MockMongoCollection.find.returns({ toArray });
                };
                listReturns([{ id: '1234' }]);
            });

            it('should result a promise', () => {

                const result = database.set(0, { id: '2345' });

                __.assertThat(result, __.is(__.instanceOf(Promise)));
            });

            describe('called', () => {
                let result;
                beforeEach(() => {
                    result = database.set(0, { id: '2345' });
                });

                it('should connect to db', () => {

                    __.assertThat(MockMongoConnection, __.hasProperty('db', __.wasCalledWith('simpleAWS')));
                });

                it('should send entry to db', () => {

                    return result.then(() => {
                        __.assertThat(updateOne, __.wasCalledWith({ id: '1234' }, { $set: { id: '2345' } }, __.func()));
                    });
                });

                it('should resolve with the given entry', () => {
                    return result.then(() => {
    
                        return __.promiseThat(result, __.willBe(
                            { id: '2345' }
                        ));
                    });
                });
            });
        });
    });
});