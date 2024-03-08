// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { router, register } = require('./routes');
const authMiddleware = require('./authMiddleware');
const process = require('process');
console.log('Node.js Version:', process.version);

const app = express();

// Updated CORS configuration with troubleshooting changes and forum insights
const allowedOrigins = [
  'https://incite-client-77f7b261a1a7.herokuapp.com',
  'chrome-extension://pljamknofgphbebllbhccjfbmdjmdfco',
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log('Incoming Origin:', origin);
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
  credentials: true, // Enable sending cookies, if needed
};

// Ensure CORS is applied before other middleware
app.use(cors(corsOptions));

app.options('*', cors(corsOptions)); // Enable pre-flight requests

// Apply the authMiddleware to all API routes
app.use('/api', authMiddleware, router);

// Root endpoint
app.get('/', (req, res) => {
  res.send('Incite Server is running!');
});

// Error handling for cors errors specifically
app.use((err, req, res, next) => {
  if (err instanceof cors.CorsError) {
    console.error('CORS error:', err.message);
    res.status(500).json({ message: 'CORS error', error: err.message });
    return;
  }
  next(err);
});

// General error handling middleware
app.use((err, req, res, next) => {
  console.error('General error:', err.message);
  res.status(500).json({ message: 'An error occurred', error: err.message });
});

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

module.exports = app;
