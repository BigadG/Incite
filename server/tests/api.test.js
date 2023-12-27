const request = require('supertest');
const express = require('express');
const { router } = require('../routes'); // Adjust the path to match your project structure

const app = express();
app.use(express.json());
app.use('/api', router); // Mount your router on the '/api' path

describe('API Endpoints', () => {
  // Test the /generateEssay endpoint without authentication
  it('should allow generating an essay without authentication', async () => {
    const res = await request(app)
      .post('/api/generateEssay')
      .send({
        premise1: 'test premise1',
        premise2: 'test premise2',
        premise3: 'test premise3'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('essay');
  });
});

