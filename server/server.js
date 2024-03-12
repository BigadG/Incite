require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { router } = require('./routes');
const authMiddleware = require('./authMiddleware');
const process = require('process');
const path = require('path');

const app = express();

// Identify the environment and set the port
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3001;

console.log(`Starting server in ${isProduction ? 'production' : 'development'} mode on port ${port}`);

// Temporarily allow requests from all origins for debugging purposes
app.use(cors({
  origin: '*', // Allow all origins
  credentials: true,
}));

// Serve static files from the React app
if (isProduction) {
  app.use(express.static(path.join(__dirname, '../client/dist')));
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
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res) => {
  console.error('Server error:', err.stack);
  res.status(500).send({ error: err.message });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

module.exports = app;
