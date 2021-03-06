const MongoClient = require("mongodb").MongoClient,
    ObjectId = require("mongodb").ObjectID,
    OId = require("mongodb").ObjectId.createFromHexString,
    config = require("config"),
    mongoOption = { useNewUrlParser: !0, useUnifiedTopology: !0 },
    url = config.get("db.url"),
    dbname = config.get("db.dbname"),
    state = { db: null },
    connect = (cb) => {
        state.db
            ? cb()
            : MongoClient.connect(url, mongoOption, (err, client) => {
                  err ? cb(err) : ((state.db = client.db(dbname)), cb());
              });
    },
    getID = (_id) => ObjectId(_id),
    getOID = (_id) => OId(_id),
    getDB = () => state.db;
module.exports = {
    getDB: getDB,
    connect: connect,
    getID: getID,
    getOID: getOID,
};
