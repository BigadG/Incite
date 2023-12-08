const { connect } = require('./database');
const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

router.post('/addSelection', async (req, res) => {
  try {
    const db = await connect();
    const { title, url } = req.body;
    const uuid = req.userId; // Now using the UUID provided by the middleware

    const result = await db.collection('Users').updateOne(
      { uuid },
      { $push: { selections: { title, url, pageId: new ObjectId(), timestamp: new Date() } } },
      { upsert: true }
    );
    res.status(200).json({ message: 'Selection added', result });
  } catch (error) {
    res.status(500).json({ message: 'Error adding selection', error });
  }
});

router.get('/selections', async (req, res) => {
  try {
    const db = await connect();
    const uuid = req.userId; // Now using the UUID provided by the middleware

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

    const result = await db.collection('Users').updateOne(
      { uuid },
      { $set: { selections: [] } }
    );
    res.status(200).json({ message: 'Selections cleared', result });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing selections', error });
  }
});

module.exports = router;




