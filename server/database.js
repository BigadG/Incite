require('dotenv').config();
const { MongoClient } = require('mongodb');

const password = process.env.MONGO_ATLAS_PASSWORD;
const dbName = process.env.DB_NAME;
// Ensure the username is URI encoded if needed
const username = encodeURIComponent('bigadgaber');
const url = `mongodb+srv://${username}:${password}@cluster0.bz2has9.mongodb.net/${dbName}?retryWrites=true&w=majority`;

// Create a new MongoClient instance and configure it for connection pooling
const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connect() {
  if (!client.isConnected()) {
    // Only connect if not already connected
    try {
      await client.connect();
      console.log('Connected to MongoDB Atlas');
    } catch (e) {
      console.error('Failed to connect to MongoDB Atlas', e);
      throw e; // Re-throw the error to handle it in the calling function
    }
  }
  
  const db = client.db(dbName);

  try {
    // Ensure the `Users` collection has an index on the `uuid` field
    await db.collection('Users').createIndex({ "uuid": 1 }, { unique: true });
  } catch (e) {
    console.error('Failed to ensure index on `Users` collection', e);
    throw e; // Re-throw the error to handle it in the calling function
  }

  return db;
}

// Export a cleanup function to close the client connection when the application is terminating
function close() {
  return client.close();
}

module.exports = { connect, close };



