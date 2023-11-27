const request = require('supertest');
const express = require('express');
const app = express();

app.use(express.json());

// Mimic your route in the test file
app.post('/api/add-selection', (req, res) => {
  res.status(200).send('Selection added successfully (placeholder)');
});

describe('POST /api/add-selection', () => {
  it('responds with success message', async () => {
    const response = await request(app)
      .post('/api/add-selection')
      .send({ url: 'http://example.com', title: 'Example' });

    expect(response.statusCode).toBe(200);
    expect(response.text).toEqual('Selection added successfully (placeholder)');
  });
});
