const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(`mongodb+srv://monojit-29-11-2020:Asdfg123@demoprojectcluster.rgixx.mongodb.net/order_schema?retryWrites=true&w=majority`, { useUnifiedTopology: true })
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
