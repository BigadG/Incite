const { connect } = require('./database');
const express = require('express');
const { ObjectId } = require('mongodb');
const { generateEssayContent } = require('./openaiService');
const authMiddleware = require('./authMiddleware');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const createDOMPurify = require('dompurify');

const router = express.Router();

async function fetchAndProcessPage(url) {
  try {
    const response = await fetch(url);
    const status = response.status;
    const contentType = response.headers.get('content-type');

    console.log(`Status Code: ${status} Content-Type: ${contentType}`);

    if (status !== 200 || !contentType.includes('text/html')) {
      throw new Error(`Non-200 status code received or content is not HTML: ${status}`);
    }

    const html = await response.text();
    console.log(`Fetched HTML for ${url}:`, html.substring(0, 500));

    // Sanitize the HTML with DOMPurify
    const window = new JSDOM('').window;
    const DOMPurify = createDOMPurify(window);
    const cleanHtml = DOMPurify.sanitize(html);

    // Now create a JSDOM instance with sanitized HTML
    const doc = new JSDOM(cleanHtml, { url });
    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    if (!article || !article.textContent) {
      throw new Error('Readability was unable to parse the article from the page.');
    }

    console.log(`Extracted text for ${url}:`, article.textContent.substring(0, 500));
    return article.textContent.trim();
  } catch (error) {
    console.error(`Error fetching or processing page at URL ${url}:`, error);
    return ''; // Return empty string to indicate failure
  }
}

const generateEssay = async (req, res) => {
  console.log('Received request body:', req.body);
  if (!req.body || typeof req.body !== 'object' || !req.body.prompts) {
    console.error('Invalid request body:', req.body);
    return res.status(400).json({ message: 'Invalid request body' });
  }
  try {
    // The `prompts` should be passed here, not the entire `req.body`
    const essay = await generateEssayContent(req.body.prompts);
    res.status(200).json({ essay });
  } catch (error) {
    console.error('GPT API Call Error:', error.message);
    res.status(500).json({ message: 'Error calling GPT API', error: error.message });
  }
};

const generateEssayWithSelections = async (req, res) => {
  try {
    console.log('Request to /generateEssayWithSelections:', req.body);
    const { premises, urls } = req.body;

    if (!Array.isArray(urls)) {
      return res.status(400).json({ message: 'URLs must be an array' });
    }

    const contentFromPages = await Promise.all(urls.map(fetchAndProcessPage));

    // Check if any page's content is null after fetching
    if (contentFromPages.includes(null)) {
      console.error('One or more pages returned null content');
      return res.status(400).json({ message: 'One or more pages could not be processed' });
    }

    // All pages' content must be valid strings; if not, throw an error
    if (contentFromPages.some(content => typeof content !== 'string' || !content.trim())) {
      console.error('Invalid or empty content found in one or more pages');
      return res.status(400).json({ message: 'Invalid or empty content found in one or more pages' });
    }
    const validContentFromPages = contentFromPages.filter(content => content && content.trim());

    // Proceed only if there's valid content
    if (validContentFromPages.length === 0) {
      return res.status(400).json({ message: 'No valid content could be fetched from the provided URLs' });
    }
  
    // Use the valid content for essay generation
    const essay = await generateEssayContent(premises, validContentFromPages.join("\n\n"));
    res.status(200).json({ essay });
  } catch (error) {
    console.error('Error generating essay with selections:', error);
    res.status(500).json({ message: 'Error generating essay with selections', error });
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

router.post('/generateEssayWithSelections', generateEssayWithSelections);

module.exports = { router, register, generateEssay, fetchAndProcessPage, generateEssayWithSelections };






