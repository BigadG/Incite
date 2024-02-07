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

router.post('/saveRecentEssay', async (req, res) => {
  console.log(req.body);
  try {
    const db = await connect();
    const { uuid, essay, selections, thesis, premises } = req.body; // Explicitly extract thesis here

    // Make sure thesis is correctly extracted and utilized
    if (!thesis) { // Add a check to ensure thesis is defined
      return res.status(400).json({ message: 'Thesis is not defined' });
    }

    // Proceed with saving the essay, selections, thesis, and premises
    await db.collection('Users').updateOne(
      { uuid },
      { $set: { recentEssay: { essay, selections, thesis, premises } } }
    );

    res.status(200).json({ message: 'Recent essay, selections, thesis, and premises saved successfully' });
  } catch (error) {
    console.error('Save Recent Essay Error:', error);
    res.status(500).json({ message: 'Error saving recent essay, selections, thesis, and premises', error });
  }
});

router.get('/getRecentEssay', async (req, res) => {
  try {
    const db = await connect();
    const uuid = req.userId;

    const user = await db.collection('Users').findOne({ uuid }, { projection: { recentEssay: 1 } });

    if (!user || !user.recentEssay) {
      return res.status(404).json({ message: 'No recent essay found' });
    }

    res.status(200).json(user.recentEssay);
  } catch (error) {
    console.error('Get Recent Essay Error:', error);
    res.status(500).json({ message: 'Error retrieving recent essay', error });
  }
});

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

const generateEssayWithSelections = async (req, res) => {
  try {
    const { urls, thesis, bodyPremises, missingCitations } = req.body;

    if (!Array.isArray(urls) || !thesis || !Array.isArray(bodyPremises)) {
      console.error('Invalid input:', req.body);
      return res.status(400).json({ message: 'Invalid input' });
    }

    // Calculate max words per selection
    const totalMaxWords = MAX_WORDS;
    const maxWordCountPerSelection = Math.floor(totalMaxWords / urls.length);

    const contentFromPages = await Promise.all(urls.map(url => fetchAndProcessPage(url, maxWordCountPerSelection)))
      .then(results => results.join("\n\n"));

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

    // Generate the essay content
    const essayContentResult = await generateEssayContent({ thesis, bodyPremises }, contentFromPages, selections);
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

    // Update the user document to clear the selections and the recent essay data
    const result = await db.collection('Users').updateOne(
      { uuid },
      { 
        $set: { 
          selections: [],
          recentEssay: { essay: "", thesis: "", premises: [], selections: null } // Reset the essay-related fields
        } 
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'User not found or no changes made' });
    }

    res.status(200).json({ message: 'Selections and essay data cleared', result });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing selections and essay data', error });
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

module.exports = { router, register, fetchAndProcessPage, generateEssayWithSelections };
