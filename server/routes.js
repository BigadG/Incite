const { connect } = require('./database');
const express = require('express');
const { ObjectId } = require('mongodb');
const { generateEssayContent } = require('./openaiService');
const authMiddleware = require('./authMiddleware');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

const router = express.Router();

// Add the fetchAndProcessPage function
async function fetchAndProcessPage(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    console.log(`Fetched HTML for ${url}:`, html); // Log the HTML content

    const doc = new JSDOM(html, { url });
    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    console.log(`Extracted text for ${url}:`, article.textContent); // Log the text content
    return article.textContent;
  } catch (error) {
    console.error('Error fetching or processing page:', error);
    return null;
  }
}


const generateEssay = async (req, res) => {
  try {
    const essay = await generateEssayContent(req.body);
    res.status(200).json({ essay });
  } catch (error) {
    console.error('GPT API Call Error:', error);
    res.status(500).json({ message: 'Error calling GPT API', error });
  }
};

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


router.use(authMiddleware);

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

router.post('/generateEssayWithSelections', async (req, res) => {
  console.log('Request to /generateEssayWithSelections:', req.body);
  try {
    const { premises, urls } = req.body;
    
    // Fetch and process each page.
    const contentFromPages = await Promise.all(urls.map(url => fetchAndProcessPage(url)));
    
    // Check if any page content is missing or invalid.
    if (contentFromPages.includes(null)) {
      throw new Error('One or more pages could not be fetched or processed.');
    }
    
    // Join the page contents into a single string.
    const pagesContentString = contentFromPages.join("\n\n");
    
    // Generate the essay.
    const essay = await generateEssayContent(premises, pagesContentString);
    
    res.status(200).json({ essay });
  } catch (error) {
    console.error('Error generating essay with selections:', error);
    res.status(500).json({ message: 'Error generating essay with selections', error: error.message });
  }
});



module.exports = { router, register, generateEssay };





