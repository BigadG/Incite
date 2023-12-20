// At the top of your server.js before any route or middleware
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  next();
});

require('dotenv').config();
const express = require('express');
const routes = require('./routes');
const authMiddleware = require('./authMiddleware');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use('/api', authMiddleware);
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
