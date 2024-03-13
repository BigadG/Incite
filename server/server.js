require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { router, register } = require('./routes');
const authMiddleware = require('./authMiddleware');

const app = express();

// Update CORS with the client's Heroku URL
app.use(cors({
    origin: ['http://localhost:5173', 'https://incite-client-77f7b261a1a7.herokuapp.com'],
    optionsSuccessStatus: 200,
}));
app.use(express.json());

app.post('/api/register', register);
app.use('/api', authMiddleware, router);

// Update the welcome route message
app.get('/', (req, res) => {
    res.send('Incite Server is running on Heroku!');
});

// Use the PORT environment variable provided by Heroku
if (process.env.NODE_ENV !== 'test') {
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}

module.exports = app;
