const { connect } = require('./database');
const express = require('express');
const router = express.Router();

// Other imports or router configuration...

router.post('/addSelection', async (req, res) => {
  try {
    const db = await connect();
    const { userId, title, url } = req.body;
    // Assuming you have a unique identifier for each user, e.g., userId.
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

module.exports = router;
