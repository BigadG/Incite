require('dotenv').config();
const express = require('express');
const routes = require('./routes');
const authMiddleware = require('./authMiddleware');

const app = express();
const port = process.env.PORT || 3001;

console.log(typeof authMiddleware); // Should log 'function'
console.log(typeof routes); // Should also log 'function'

app.use('/api', authMiddleware);
app.use('/api', routes);

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
