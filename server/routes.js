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


router.post('/updateSelections', async (req, res) => {
  try {
    const db = await connect();
    const { updatedSelections, uuid } = req.body;

    updatedSelections.forEach(async (selection) => {
      await db.collection('Users').updateOne(
        { uuid, 'selections.url': selection.url },
        { $set: { 'selections.$.author': selection.author, 'selections.$.publicationDate': selection.publicationDate } }
      );
    });

    res.status(200).json({ message: 'Selections updated' });
  } catch (error) {
    console.error('Update Selections Error:', error);
    res.status(500).json({ message: 'Error updating selections', error });
  }
});

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
    const { urls, thesis, bodyPremises, missingCitations } = req.body;

    if (!Array.isArray(urls) || !thesis || !Array.isArray(bodyPremises)) {
      console.error('Invalid input:', req.body);
      return res.status(400).json({ message: 'Invalid input' });
    }

    const validatedBodyPremises = Array.isArray(bodyPremises) ? bodyPremises : [];
    const totalMaxWords = MAX_WORDS < 700 ? 700 : MAX_WORDS;
    const maxWordCountPerSelection = Math.floor(totalMaxWords / urls.length);

    const contentFromPages = await Promise.allSettled(urls.map(url => fetchAndProcessPage(url, maxWordCountPerSelection)))
        .then(results => results.filter(result => result.status === 'fulfilled').map(result => result.value));

    if (contentFromPages.some(content => content === '')) {
      console.error('One or more pages returned no content:', contentFromPages);
      return res.status(400).json({ message: 'One or more pages could not be processed' });
    }

    // Retrieve selections from the database for citation information
    const db = await connect();
    const uuid = req.userId;
    const user = await db.collection('Users').findOne({ uuid });
    console.log('User selections retrieved:', user.selections);
    let selections = user ? user.selections : []; // Include title, url, author, publicationDate

    // If there are any missing citations provided by the user, replace the corresponding selection
    if (missingCitations && missingCitations.length > 0) {
      missingCitations.forEach((missing) => {
        const index = selections.findIndex(sel => sel.url === missing.url);
        console.log('Missing citations received:', missingCitations);
        console.log('Selections after update:', selections);
        if (index !== -1) {
          selections[index].author = missing.author || selections[index].author;
          selections[index].publicationDate = missing.publicationDate || selections[index].publicationDate;
        } else {
          console.error(`URL not found in selections: ${missing.url}`);
        }
      });
    }

    // Generate the essay content, passing the selections (with any updates)
    const essayContentResult = await generateEssayContent({ thesis, bodyPremises: validatedBodyPremises }, contentFromPages.join("\n\n"), selections);

    if (essayContentResult.missingCitations && essayContentResult.missingCitations.length > 0) {
      return res.status(200).json({
        missingCitations: essayContentResult.missingCitations
      });
    }
    
    // If missing citations were identified by generateEssayContent, send them back to the client
    if (essayContentResult.missingCitations) {
      console.log('Sending missingCitations to client:', essayContentResult.missingCitations);
      return res.status(200).json({
        missingCitations: essayContentResult.missingCitations.map(missing => {
          return {
            url: missing.url, // Make sure this is the correct URL from the selections
            author: missing.author || '',
            publicationDate: missing.publicationDate || '',
            missingFields: missing.missingFields
          };
        })
      });
    }

    // If an essay was generated successfully, send it back to the client
    res.status(200).json({ essay: essayContentResult });
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
    const { title, url, author, publicationDate } = req.body; // Extract author and publicationDate from the request body
    const uuid = req.userId;

    const result = await db.collection('Users').updateOne(
      { uuid },
      { $push: { selections: { title, url, author, publicationDate, pageId: new ObjectId(), timestamp: new Date() } } }, // Store author and publicationDate
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






