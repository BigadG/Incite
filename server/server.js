require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { router, register } = require('./routes');
const authMiddleware = require('./authMiddleware');

const app = express();
const port = process.env.PORT || 3001;

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Register route that should not be protected by the authMiddleware
app.post('/api/register', register);

// Other routes
app.use('/api', router); // No authMiddleware here

app.get('/', (req, res) => {
  res.send('Incite Server is running!');
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
};

module.exports = app;

 
