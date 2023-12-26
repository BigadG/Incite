const { connect } = require('./database');
const express = require('express');
const { ObjectId } = require('mongodb');

const router = express.Router();

const axios = require('axios');

// Calls the GPT API
const callGPTAPI = async (prompt) => {
  const response = await axios.post('https://api.openai.com/v1/engines/davinci/completions', {
    prompt: prompt,
    max_tokens: 150, // Adjust as necessary
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    }
  });
  return response.data.choices[0].text;
};

// Handles the GPT API call
router.post('/generateEssay', async (req, res) => {
  try {
    const { premises, data, sources } = req.body;
    const prompt = `Summarize the following information:\nPremises: ${premises}\nData: ${data}\nSources: ${sources}`;
    const essay = await callGPTAPI(prompt);
    res.status(200).json({ essay });
  } catch (error) {
    console.error('GPT API Call Error:', error);
    res.status(500).json({ message: 'Error calling GPT API', error });
  }
});

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

    const result = await db.collection('Users').updateOne(
      { uuid },
      { $push: { selections: { title, url, pageId: new ObjectId(), timestamp: new Date() } } },
      { upsert: true }
    );
    res.status(200).json({ message: 'Selection added', result });
  } catch (error) {
    console.error('Add Selection Error:', error);
    res.status(500).json({ message: 'Error adding selection', error });
  }
});

router.get('/selections', async (req, res) => {
  try {
    const db = await connect();
    const uuid = req.userId;

    const user = await db.collection('Users').findOne({ uuid });
    res.status(200).json(user ? user.selections : []);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving selections', error });
  }
});

router.post('/clearSelections', async (req, res) => {
  try {
    const db = await connect();
    const uuid = req.userId;

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
    const pageId = new ObjectId(req.params.pageId);
    const uuid = req.userId;

    const result = await db.collection('Users').updateOne(
      { uuid, 'selections.pageId': pageId },
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





