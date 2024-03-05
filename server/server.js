require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { router, register } = require('./routes');
const authMiddleware = require('./authMiddleware');

const app = express();

// Disable CORS for all routes as a temporary measure
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'], // Allow all methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow all headers
  credentials: true, // Allow credentials
  optionsSuccessStatus: 204,
}));

app.use(express.json());

// Since CORS is disabled, this might not be necessary, but we'll keep it for completeness
app.options('*', cors());

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

module.exports = app;
