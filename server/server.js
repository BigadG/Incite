require('dotenv').config(); // Require dotenv at the top to use environment variables
const express = require('express');
const routes = require('./routes'); // Import the router from routes.js
const { authMiddleware } = require('./middleware/authMiddleware'); // Correctly destructure if it's a named export

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Apply the auth middleware to all routes starting with '/api'
// It's important to put this line before the routes so that it applies the middleware
app.use('/api', authMiddleware);

// Mount the routes from routes.js to the '/api' path
app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('Incite Server is running!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
