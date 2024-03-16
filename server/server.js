require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { router, register } = require('./routes');
const authMiddleware = require('./authMiddleware');
const path = require('path');

const app = express();

// Define allowed origins for CORS
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'https://incite-client-77f7b261a1a7.herokuapp.com',
  process.env.CHROME_ORIGIN || 'chrome-extension://pljamknofgphbebllbhccjfbmdjmdfco'
];

// Set up CORS to accept requests from deployed client application and Chrome extension
app.use(cors({
  origin: function (origin, callback) {
    console.log('Origin received in CORS configuration:', origin); // Additional logging
    // allow requests with no origin (like mobile apps, curl requests, or the server itself)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origin not allowed by CORS policy: ' + origin));
    }
  },
  credentials: true, // If frontend needs to send cookies or authentication over CORS, enable this
  optionsSuccessStatus: 200,
}));

app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

app.post('/api/register', register);
app.use('/api', authMiddleware, router);

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});

// Configure the server to listen on the port provided by Heroku environment
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

module.exports = app;
