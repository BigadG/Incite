require('dotenv').config();
const express = require('express');
const { router, register } = require('./routes');
const authMiddleware = require('./authMiddleware');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Register route that should not be protected by the authMiddleware
app.post('/api/register', register);

// Apply authMiddleware to all routes except for /register
app.use('/api', authMiddleware);

// Other routes
app.use('/api', router);

app.get('/', (req, res) => {
  res.send('Incite Server is running!');
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}

module.exports = app;
