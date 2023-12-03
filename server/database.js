const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

async function connect() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db('InciteDB');
    return db;
  } catch (e) {
    console.error(e);
  }
}

module.exports = { connect };
