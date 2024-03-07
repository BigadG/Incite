require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { router, register } = require('./routes');
const authMiddleware = require('./authMiddleware');
const process = require('process');
console.log('Node.js Version:', process.version);

const app = express();

// Updated CORS configuration with troubleshooting changes
const allowedOrigins = [
  'https://incite-client-77f7b261a1a7.herokuapp.com',
  'chrome-extension://pljamknofgphbebllbhccjfbmdjmdfco' // Hardcoded for testing
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log('Incoming Origin:', origin); // Log for debugging 
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// Ensure CORS is applied before other middleware
app.use(cors(corsOptions)); 

app.options('*', cors(corsOptions)); // Enable pre-flight requests

app.post('/api/register', register);
app.use('/api', authMiddleware, router);

app.get('/', (req, res) => {
  res.send('Incite Server is running!');
});

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3001; 
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

module.exports = app;