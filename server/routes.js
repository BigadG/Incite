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

// In your route handler for '/updateSelections'
router.post('/updateSelections', async (req, res) => {
  try {
      const db = await connect();
      const { updatedSelections, uuid } = req.body;

      // Process each updated selection
      updatedSelections.forEach(async (selection) => {
          const updateFields = {};
          if (selection.author !== undefined) {
              updateFields['selections.$.author'] = selection.author;
          }
          if (selection.publicationDate !== undefined) {
              updateFields['selections.$.publicationDate'] = selection.publicationDate;
          }

          await db.collection('Users').updateOne(
              { uuid, 'selections.url': selection.url },
              { $set: updateFields }
          );
      });

      res.status(200).json({ message: 'Selections updated successfully' });
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

    const db = await connect();
    const uuid = req.userId;
    const user = await db.collection('Users').findOne({ uuid });

    if (!user) {
      console.error('User not found:', uuid);
      return res.status(404).json({ message: 'User not found' });
    }

    let selections = user.selections.filter(selection => urls.includes(selection.url));
    console.log('User selections retrieved:', selections);

    // Handle missing citations
    if (missingCitations && missingCitations.length > 0) {
      missingCitations.forEach(missing => {
        const index = selections.findIndex(sel => sel.url === missing.url);
        if (index !== -1) {
          selections[index] = { ...selections[index], ...missing };
        }
      });
      console.log('Updated selections with user-provided citations:', selections);
    }

    // Check for missing citation information in selections
    let missingCitationsResponse = selections.map(sel => {
      return {
        title: sel.title, // Include the title in the response
        url: sel.url,
        missingFields: {
          author: !sel.author || sel.author === 'Unknown',
          publicationDate: !sel.publicationDate,
        }
      };
    }).filter(sel => sel.missingFields.author || sel.missingFields.publicationDate);

    if (missingCitationsResponse.length > 0) {
      // Respond with missing citation information
      console.log('Missing citation information identified, sending to client:', missingCitationsResponse);
      return res.status(200).json({ missingCitations: missingCitationsResponse });
    }

    // Assuming contentFromPages is generated here or earlier in the function
    const contentFromPages = await Promise.all(urls.map(url => fetchAndProcessPage(url)))
      .then(results => results.filter(result => result.status === 'fulfilled').map(result => result.value).join("\n\n"));

    // Generate the essay content
    const essayContentResult = await generateEssayContent({ thesis, bodyPremises }, contentFromPages, selections);

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
