require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Import the cors package
const { router, register } = require('./routes');
const authMiddleware = require('./authMiddleware');

const app = express();
const port = process.env.PORT || 3001;

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
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
 
