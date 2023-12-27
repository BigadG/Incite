const request = require('supertest');
const express = require('express');
const { router } = require('../server/routes'); // Adjust the path to match your project structure

const app = express();
app.use(express.json());
app.use('/api', router); // Mount your router on the '/api' path

describe('API Endpoints', () => {
  // Test the /generateEssay endpoint without authentication
  it('should allow generating an essay without authentication', async () => {
    const res = await request(app)
      .post('/api/generateEssay')
      .send({
        premises: 'test premises',
        data: 'test data',
        sources: 'test sources'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('essay');
  });
});

