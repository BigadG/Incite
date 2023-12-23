const { connect } = require('./database');
const express = require('express');
const { ObjectId } = require('mongodb');

// Separate the router and register function for clarity
const router = express.Router();

// This is the new registration endpoint function
const register = async (req, res) => {
  try {
    const { uuid } = req.body;
    const db = await connect();
    await db.collection('Users').updateOne(
      { uuid },
      { $setOnInsert: { uuid, selections: [] } },
      { upsert: true }
    );
    res.status(200).json({ message: 'UUID registered' });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Error during registration', error });
  }
};

router.post('/addSelection', async (req, res) => {
  try {
    const db = await connect();
    const { title, url } = req.body;
    const uuid = req.userId; // Now using the UUID provided by the middleware

    // Ensure you are using the correct collection name
    const result = await db.collection('Users').updateOne(
      { uuid },
      { $push: { selections: { title, url, pageId: new ObjectId(), timestamp: new Date() } } },
      { upsert: true }
    );
    res.status(200).json({ message: 'Selection added', result });
  } catch (error) {
    console.error('Add Selection Error:', error); // This will log the error to the console
    res.status(500).json({ message: 'Error adding selection', error });
  }
});

router.get('/selections', async (req, res) => {
  try {
    const db = await connect();
    const uuid = req.userId; // Now using the UUID provided by the middleware

    // Again, ensure consistent use of the collection name
    const user = await db.collection('Users').findOne({ uuid });
    res.status(200).json(user ? user.selections : []);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving selections', error });
  }
});

router.post('/clearSelections', async (req, res) => {
  try {
    const db = await connect();
    const uuid = req.userId; // Now using the UUID provided by the middleware

    // And once more, ensure you are targeting the correct collection
    const result = await db.collection('Users').updateOne(
      { uuid },
      { $set: { selections: [] } }
    );
    res.status(200).json({ message: 'Selections cleared', result });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing selections', error });
  }
});

router.delete('/deleteSelection/:pageId', async (req, res) => {
  try {
    const db = await connect();
    // Create a new ObjectId instance with 'new'
    const pageId = new ObjectId(req.params.pageId); // Corrected usage
    const uuid = req.userId;

    // The $pull operation should match the pageId correctly
    const result = await db.collection('Users').updateOne(
      { uuid, 'selections.pageId': pageId }, // Use the new ObjectId instance
      { $pull: { selections: { pageId: pageId } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'No selection found with the given ID' });
    }

    res.status(200).json({ message: 'Selection deleted' });
  } catch (error) {
    console.error('Delete Selection Error:', error);
    res.status(500).json({ message: 'Error deleting selection', error });
  }
});


module.exports = { router, register };





