const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

// use built-in Express middleware for JSON
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Incite Server is running!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// Placeholder route for adding a selection
app.post('/api/add-selection', (req, res) => {
    // Placeholder response - in a real scenario, you would handle the request here
    res.status(200).send('Selection added successfully (placeholder)');
  });
  