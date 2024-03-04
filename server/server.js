require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { router, register } = require('./routes');
const authMiddleware = require('./authMiddleware');

const app = express();

// Define allowed origins for CORS
const allowedOrigins = [
  'https://incite-client-77f7b261a1a7.herokuapp.com',
  'chrome-extension://pljamknofgphbebllbhccjfbmdjmdfco'
];

// CORS middleware setup to include preflight check
app.use(cors({
  origin: function(origin, callback) {
    console.log("Received request from origin:", origin); // Logs every incoming origin

    if (process.env.NODE_ENV === 'development') {
      console.log("Allowing all origins in development mode.");
      return callback(null, true);
    }

    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) >= 0) {
      callback(null, true);
    } else {
      console.error('CORS policy rejection for origin:', origin); // Log rejected origin
      callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    }
  },
  optionsSuccessStatus: 200
}));

app.options('*', cors());

app.use(express.json());

app.post('/api/register', register);

app.use('/api', authMiddleware, router);

app.get('/', (req, res) => {
  res.send('Incite Server is running!');
});

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

module.exports = app;
