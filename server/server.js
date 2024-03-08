require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { router } = require('./routes');
const authMiddleware = require('./authMiddleware');
const process = require('process');

const app = express();

// Identify the environment and set the port
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3001;

console.log(`Starting server in ${isProduction ? 'production' : 'development'} mode on port ${port}`);

// Allow CORS from your client app URL and the Chrome extension ID
const allowedOrigins = [
  'https://incite-client-77f7b261a1a7.herokuapp.com',
  'chrome-extension://pljamknofgphbebllbhccjfbmdjmdfco',
];

app.use(cors({
  origin: function (origin, callback) {
    // Log every request's origin for debugging
    console.log('Origin of request allowed:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // If not found, log and block the request
    console.error('Origin blocked by CORS:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Serve static files from the React app
if (isProduction) {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Parse JSON bodies
app.use(express.json());

// Apply the authMiddleware to all API routes
app.use('/api', authMiddleware, router);

// Default route for server check
app.get('/', (req, res) => {
  res.send('Incite Server is running!');
});

// Handle production case, serve the client's index.html
if (isProduction) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).send({ error: err.message });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

module.exports = app;