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

const MAX_WORDS = 5000; // Maximum number of words I want to extract in total

async function fetchAndProcessPage(url, maxWordCount) {
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

    // Truncate the text to the maximum word count allowed per selection
    const words = article.textContent.trim().split(/\s+/);
    const truncatedText = words.length > maxWordCount ? words.slice(0, maxWordCount).join(' ') + '...' : article.textContent.trim();
    
    return truncatedText;
  } catch (error) {
    console.error(`Error fetching or processing page at URL ${url}:`, error);
    return ''; // Return empty string to indicate failure
  }
}

const generateEssay = async (req, res) => {
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
    const { urls, premises } = req.body; // Ensure you're getting premises from the request body

    if (!Array.isArray(urls)) {
      console.error('URLs provided are not an array:', urls);
      return res.status(400).json({ message: 'URLs must be an array' });
    }
    
    // Calculate the max word count per selection based on total max words allowed
    const totalMaxWords = MAX_WORDS < 700 ? 700 : MAX_WORDS;
    const maxWordCountPerSelection = Math.floor(totalMaxWords / urls.length);

    // Fetch and process the content from each page
    const contentFromPages = await Promise.allSettled(urls.map(url => fetchAndProcessPage(url, maxWordCountPerSelection)))
      .then(results => results.filter(result => result.status === 'fulfilled').map(result => result.value));

    // Check if any page content could not be processed
    if (contentFromPages.some(content => content === '')) {
      console.error('One or more pages returned no content:', contentFromPages);
      return res.status(400).json({ message: 'One or more pages could not be processed' });
    }
    
    // Retrieve selections from the database to get the citation information
    const db = await connect();
    const uuid = req.userId;
    const user = await db.collection('Users').findOne({ uuid });
    const selections = user ? user.selections : []; // This should include title, url, author, publicationDate

    // Pass the premises and selections along with the content to the GPT API to generate the essay
    const essay = await generateEssayContent(premises, contentFromPages.join("\n\n"), selections);
    res.status(200).json({ essay });
  } catch (error) {
    console.error('Error generating essay with selections:', error);
    res.status(500).json({ message: 'Error generating essay with selections', error: error.toString() });
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






