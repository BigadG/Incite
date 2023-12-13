require('dotenv').config();
const express = require('express');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Use the authMiddleware only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  const authMiddleware = require('./authMiddleware');
  app.use('/api', authMiddleware);
}

app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('Incite Server is running!');
});

// Start the server only if running this file directly (i.e., not in test mode)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}

module.exports = app;
