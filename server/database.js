require('dotenv').config();
const { MongoClient } = require('mongodb');

const password = process.env.MONGO_ATLAS_PASSWORD; // Make sure to set this environment variable.
const dbName = process.env.DB_NAME; // Your database name.
const url = `mongodb+srv://bigadgaber:${password}@cluster0.bz2has9.mongodb.net/${dbName}?retryWrites=true&w=majority`;

const client = new MongoClient(url);

async function connect() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    const db = client.db(dbName);
    return db;
  } catch (e) {
    console.error('Failed to connect to MongoDB Atlas', e);
  }
}

module.exports = { connect };

