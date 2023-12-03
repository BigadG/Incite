const { connect } = require('./database');
const express = require('express');
const { ObjectId } = require('mongodb'); // Make sure to import ObjectId
const router = express.Router();

// POST route to add selection
router.post('/addSelection', async (req, res) => {
  try {
    const db = await connect();
    // Extract userId from request, assuming authentication is handled upstream
    const { userId, title, url } = req.body;
    // Assuming you have a unique identifier for each user, e.g., userId.
    // ObjectId is used to create a unique identifier for the selection
    const result = await db.collection('Users').updateOne(
      { userId },
      { $push: { selections: { title, url, pageId: new ObjectId(), timestamp: new Date() } } },
      { upsert: true }
    );
    res.status(200).json({ message: 'Selection added', result });
  } catch (error) {
    res.status(500).json({ message: 'Error adding selection', error });
  }
});

// GET route to retrieve selections
router.get('/selections/:userId', async (req, res) => {
  try {
    const db = await connect();
    // Extract userId from request parameters
    const userId = req.params.userId; // Assuming you're passing userId as a URL parameter.
    const user = await db.collection('Users').findOne({ userId });
    // If user is found, return their selections, otherwise return an empty array
    res.status(200).json(user ? user.selections : []);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving selections', error });
  }
});

// POST route to clear the selections
router.post('/clearSelections', async (req, res) => {
  try {
    const db = await connect();
    // Extract userId from request body, assuming authentication is handled upstream
    const { userId } = req.body;
    // Clear the selections array for the user
    const result = await db.collection('Users').updateOne(
      { userId },
      { $set: { selections: [] } }
    );
    res.status(200).json({ message: 'Selections cleared', result });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing selections', error });
  }
});

// Export the router to be used in server.js
module.exports = router;

