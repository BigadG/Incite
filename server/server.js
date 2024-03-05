require('dotenv').config();
const express = require('express');
const { router, register } = require('./routes');
const authMiddleware = require('./authMiddleware');

const app = express();

// Manually set headers to allow all CORS requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

app.use(express.json());

app.post('/api/register', register);
app.use('/api', authMiddleware, router);

app.get('/', (req, res) => {
  res.send('Incite Server is running!');
});

// Listen to the App Engine-specified port, or 3001 otherwise
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

module.exports = app;
