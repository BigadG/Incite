require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { router, register, generateEssay, generateEssayWithSelections } = require('./routes');
const authMiddleware = require('./authMiddleware');

const app = express();
const port = process.env.PORT || 3001;

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200 
};

app.use(cors(corsOptions)); 
app.use(express.json()); 

// Routes that don't require authentication
app.post('/api/register', register);
app.post('/api/generateEssay', generateEssay);
app.post('/api/generateEssayWithSelections', generateEssayWithSelections);

// Apply authentication middleware to all the routes defined from this point onwards
app.use('/api', authMiddleware);

app.use('/api', router);


// Apply authentication middleware to all the routes defined from this point onwards
app.use('/api', authMiddleware);

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


 
