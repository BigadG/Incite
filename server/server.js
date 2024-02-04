require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { router, register } = require('./routes');
const authMiddleware = require('./authMiddleware');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200,
}));
app.use(express.json());

// Routes that don't require authentication
app.post('/api/register', register);
// Move protected routes under the authMiddleware
app.use('/api', authMiddleware, router);

app.get('/', (req, res) => {
    res.send('Incite Server is running!');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});


module.exports = app;


 
