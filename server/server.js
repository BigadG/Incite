require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { router, register } = require('./routes');
const authMiddleware = require('./authMiddleware');

const app = express();

// Set up CORS to allow requests from your React app's production URL and your Chrome extension's ID
const allowedOrigins = [
  'https://incite-client-77f7b261a1a7.herokuapp.com',
  'chrome-extension://pljamknofgphbebllbhccjfbmdjmdfco' // Extension ID
]; 

app.use(cors({
  origin: function (origin, callback) {
    // Include explicit checks for null or undefined origin
    if (!origin) {
      // Allow requests with no origin  
      return callback(null, true); 
    }
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS'], // Explicitly allow methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Explicitly allow headers
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
}));
app.use(express.json());

app.options('*', cors()); // Enable pre-flight across the board for OPTIONS method

app.post('/api/register', register);
app.use('/api', authMiddleware, router);

app.get('/', (req, res) => {
  res.send('Incite Server is running!');
});

if (process.env.NODE_ENV !== 'test') {
  // The port is set by Heroku dynamically
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

router.post('/register', async (req, res) => {
  try {
    const { uuid } = req.body;
    if (!uuid) {
      console.error('Registration Error: UUID not provided');
      return res.status(400).json({ message: 'UUID not provided' });
    }
    const db = await connect(); // Ensure that a connection failure here is caught
    const result = await db.collection('Users').updateOne(
      { uuid },
      { $setOnInsert: { uuid, selections: [] } },
      { upsert: true }
    );
    console.log(`Registration Result for UUID ${uuid}:`, result);
    if (result.upsertedCount > 0) {
      console.log(`UUID registered: ${uuid}`);
      return res.status(200).json({ message: 'UUID registered' });
    } else {
      console.log(`UUID already exists: ${uuid}`);
      return res.status(200).json({ message: 'UUID already exists' });
    }
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Error during registration', error: error.message });
  }
});

module.exports = app;