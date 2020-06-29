'use strict';

const env = process.env;

const { MongoClient } = require('mongodb');
const host = env.DB_HOST || 'localhost';
const port = env.DB_PORT || '27017';
const url = `mongodb://${host}:${port}/`;
const dbName = env.DB_NAME || 'simpleAWS';
const tableName = 'entries';

module.exports = function createDatabase() {

    console.log(`USE MONGO: ${url}${dbName}/${tableName}`);

    createDb();
    createCollection();
    
    let instance = {
        getList: () => {
            return new Promise((resolve, reject) => {
                MongoClient.connect(url, function(err, db) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    var dbo = db.db(dbName);
                    dbo.collection(tableName).find({}).toArray(function (err, result) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(result);
                        db.close();
                    });
                });
            });
        },
        push: (entry) => {
            return new Promise((resolve, reject) => {
                MongoClient.connect(url, function(err, db) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    var dbo = db.db(dbName);
                    dbo.collection(tableName).insertOne(entry, function(err, res) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(entry);
                        db.close();
                    });
                });
            });
        },
        find: (callback) => {
            return new Promise((resolve, reject) => {
                MongoClient.connect(url, function(err, db) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    var dbo = db.db(dbName);
                    dbo.collection(tableName).find({}).toArray(function (err, result) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(result.find(callback));
                        db.close();
                    });
                });
            });
        },
        findIndex: (callback) => {
            return new Promise((resolve, reject) => {
                MongoClient.connect(url, function(err, db) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    var dbo = db.db(dbName);
                    dbo.collection(tableName).find({}).toArray(function (err, result) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(result.findIndex(callback));
                        db.close();
                    });
                });
            });
        },
        delete: (entry) => {
            return new Promise((resolve, reject) => {
                MongoClient.connect(url, function(err, db) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    var dbo = db.db(dbName);
                    dbo.collection(tableName).deleteOne(entry, function(err, obj) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve();
                        db.close();
                    });
                });
            });
        },
        splice: (index, length) => {
            return instance.getList().then((list) => {
                return Promise.all(
                    list.slice(index, index + length)
                        .map((entry) => {
                            return instance.delete(entry);
                        })
                );
            });
        },
        set: (index, item) => {
            return instance.getList().then((list) => {
                const entry = list[index];
                return new Promise((resolve, reject) => {
                    MongoClient.connect(url, function(err, db) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        var dbo = db.db(dbName);
                        var newvalues = { $set: item };
                        dbo.collection(tableName).updateOne(entry, newvalues, function(err, res) {
                            if (err) {
                                reject(err);
                                return;
                            }
                            resolve(item);
                            db.close();
                        });
                    });
                });
            });
        },
        toString: () => `mongoDB ${url}`,
    };
    return instance;
}

function createDb() {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function(err, db) {
            if (err) {
                reject(err);
                return;
            };
            console.log("Database created!");
            db.close();
            resolve();
        });
    });
}

function connected(callback) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function(connectErr, db) {
            if (connectErr) {
                reject(connectErr);
                return;
            }
            var dbo = db.db(dbName);
            resolve(callback(dbo, db));
        });
    });
}

function createCollection() {
    return connected((dbo, db) => {
        dbo.createCollection(tableName, function (err, res) {
            if (err) {
                reject(err);
                return;
            }
            console.log('Collection created!');
            db.close();
        });
    });
}

function find() {
    return connected((dbo, db) => {
        dbo.createCollection(tableName, function (err, res) {
            if (err) {
                reject(err);
                return;
            }
            console.log('Collection created!');
            db.close();
        });
    });
}