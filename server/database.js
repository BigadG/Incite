require('dotenv').config();
const { MongoClient } = require('mongodb');

const password = process.env.MONGO_ATLAS_PASSWORD;
const dbName = process.env.DB_NAME;
const url = `mongodb+srv://bigadgaber:${password}@cluster0.bz2has9.mongodb.net/${dbName}?retryWrites=true&w=majority`;

const client = new MongoClient(url);

async function connect() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    const db = client.db(dbName);
    await db.collection('Users').createIndex({ "uuid": 1 }, { unique: true });
    return db;
  } catch (e) {
    console.error('Database connection error:', e.message);
    throw new Error('Database connection error'); // Throwing a generic error message
  }
}

async function closeDatabase() {
  await client.close();
  console.log('Disconnected from MongoDB Atlas');
}

module.exports = { connect, closeDatabase };


