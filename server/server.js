require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { router, register } = require('./routes');
const authMiddleware = require('./authMiddleware');

const app = express();

// Temporarily allow all origins to isolate the CORS issue
app.use(cors({
  origin: function (origin, callback) {
    console.log("Received origin:", origin); // Debug: Log received origin
    // Allow all origins temporarily
    callback(null, true);

    // Previous specific origin handling (commented out for debugging)
    // const allowedOrigins = [
    //   'https://incite-client-77f7b261a1a7.herokuapp.com',
    //   'chrome-extension://pljamknofgphbebllbhccjfbmdjmdfco'
    // ];
    // if (!origin) return callback(null, true); // Allow requests with no origin
    // if (allowedOrigins.indexOf(origin) === -1) {
    //   const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    //   return callback(new Error(msg), false);
    // }
    // return callback(null, true);
  },
  optionsSuccessStatus: 200, // For legacy browser support
  credentials: true, // Enable credentials
  allowedHeaders: ['Content-Type', 'Authorization'] // Specify allowed headers
}));

// Enable preflight requests for all routes
app.options('*', cors());

app.use(express.json());

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