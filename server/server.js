require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { router, register } = require('./routes');
const authMiddleware = require('./authMiddleware');

const app = express();

// Define allowed origins for CORS
const allowedOrigins = [
  'https://incite-client-77f7b261a1a7.herokuapp.com',
  'chrome-extension://pljamknofgphbebllbhccjfbmdjmdfco'
];

// CORS middleware setup to include preflight check
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Check if the origin is in the list of allowed origins
    if (allowedOrigins.indexOf(origin) >= 0) {
      callback(null, true);
    } else {
      callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    }
  },
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// Enable preflight requests for all routes
app.options('*', cors());

app.use(express.json());

// Register route for UUID registration
app.post('/api/register', register);

// Use authentication middleware for API routes
app.use('/api', authMiddleware, router);

// Root route to check if the server is running
app.get('/', (req, res) => {
  res.send('Incite Server is running!');
});

// Server listening setup
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

module.exports = app;