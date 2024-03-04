require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { router, register } = require('./routes');
const authMiddleware = require('./authMiddleware');

const app = express();

const allowedOrigins = [
  'https://incite-client-77f7b261a1a7.herokuapp.com',
  'chrome-extension://pljamknofgphbebllbhccjfbmdjmdfco',
];

app.use(cors({
  origin: function(origin, callback) {
    if (process.env.NODE_ENV === 'development' || allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy does not allow access from the specified Origin'), false);
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
  optionsSuccessStatus: 204,
}));

app.use(express.json());

app.post('/api/register', register);
app.use('/api', authMiddleware, router);

app.get('/', (req, res) => res.send('Incite Server is running!'));

// Conditionally start the server only if the file is run directly
if (require.main === module) {
  const port = process.env.PORT || 3001;
  app.listen(port, () => console.log(`Server is listening on port ${port}`));
}

module.exports = app;
