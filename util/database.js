const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const config = require('../config.json')

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(config.mongodbURL, { useUnifiedTopology: true })
    .then((result) => {
      console.log('connected');
      _db = result.db();
      callback();
    })
    .catch((error) => {
      console.log(error);
      throw error;
    })
}

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw 'No database found!';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
