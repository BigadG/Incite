// server/server.js
const express = require('express');
const authMiddleware = require('./authMiddleware'); // Import the middleware

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Use the auth middleware for routes that need protection
app.use('/api', authMiddleware);

app.get('/', (req, res) => {
  res.send('Incite Server is running!');
});

// Secure this route with the auth middleware
app.post('/api/add-selection', authMiddleware, (req, res) => {
  // Your secure logic here
  res.status(200).send('Selection added successfully');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
