// This file servers the purpose of connecting to database.
// Importing the modues.
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const OId = require("mongodb").ObjectId.createFromHexString;
const config = require("config");
const mongoOption = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
// Getting the variable values from config file.
const url = config.get("db.url");
const dbname = config.get("db.dbname");
// Connecting to server.
const state = {
    db: null,
};
const connect = (cb) => {
    if (state.db) cb();
    else {
        MongoClient.connect(url, mongoOption, (err, client) => {
            if (err) cb(err);
            else {
                state.db = client.db(dbname);
                cb();
            }
        });
    }
};
// Making useful functions.
const getID = (_id) => {
    return ObjectId(_id);
};
const getOID = (_id) => {
    return OId(_id);
};
const getDB = () => {
    return state.db;
};

module.exports = { getDB, connect, getID, getOID };
