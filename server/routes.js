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
const MAX_WORDS = 5000;

async function fetchAndProcessPage(url, maxWordCount) {
  try {
    const response = await fetch(url);
    if (response.status !== 200 || !response.headers.get('content-type').includes('text/html')) {
      throw new Error(`Non-200 status code or content is not HTML: ${response.status}`);
    }

    const html = await response.text();
    const window = new JSDOM('').window;
    const cleanHtml = createDOMPurify(window).sanitize(html);
    const doc = new JSDOM(cleanHtml, { url });
    const article = new Readability(doc.window.document).parse();

    if (!article || !article.textContent) {
      throw new Error('Unable to parse the article.');
    }

    const words = article.textContent.trim().split(/\s+/);
    return words.length > maxWordCount ? words.slice(0, maxWordCount).join(' ') + '...' : article.textContent.trim();
  } catch (error) {
    console.error(`Error fetching or processing page at ${url}:`, error);
    return '';
  }
}

const generateEssay = async (req, res) => {
  if (!req.body || typeof req.body !== 'object' || !req.body.prompts) {
    console.error('Invalid request body:', req.body);
    return res.status(400).json({ message: 'Invalid request body' });
  }
  try {
    const essay = await generateEssayContent(premises, contentFromPages.join("\n\n"), selections);
    res.status(200).json({ essay });
  } catch (error) {
    console.error('GPT API Call Error:', error.message);
    res.status(500).json({ message: 'Error calling GPT API', error: error.message });
  }
};

async function generateEssayWithSelections(req, res) {
  try {
    const { urls, premises } = req.body;
    if (!Array.isArray(urls)) {
      return res.status(400).json({ message: 'URLs must be an array' });
    }

    const maxWordCountPerSelection = Math.floor(MAX_WORDS / urls.length);
    const contentFromPages = await Promise.allSettled(urls.map(url => fetchAndProcessPage(url, maxWordCountPerSelection)))
      .then(results => results.filter(result => result.status === 'fulfilled').map(result => result.value));

    if (contentFromPages.some(content => content === '')) {
      return res.status(400).json({ message: 'One or more pages could not be processed' });
    }

    const db = await connect();
    const selections = (await db.collection('Users').findOne({ uuid: req.userId }))?.selections ?? [];
    const essay = await generateEssayContent(premises, contentFromPages.join("\n\n"), selections);
    res.status(200).json({ essay });
  } catch (error) {
    console.error('Error generating essay:', error);
    res.status(500).json({ message: 'Error generating essay', error: error.toString() });
  }
}

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
    const { title, url, author, publicationDate } = req.body;

    // Validate author and publicationDate
    const validAuthor = author || 'Unknown'; // Use 'Unknown' if author is falsy
    const validPublicationDate = publicationDate ? publicationDate : 'Unknown'; // Use 'Unknown' if publicationDate is null or undefined

    const uuid = req.userId;

    const result = await db.collection('Users').updateOne(
      { uuid },
      { $push: { selections: { title, url, author: validAuthor, publicationDate: validPublicationDate, pageId: new ObjectId(), timestamp: new Date() } } },
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






