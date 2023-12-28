const request = require('supertest');
const express = require('express');
const { generateEssay } = require('../routes');
const bodyParser = require('body-parser');

jest.mock('../openaiService', () => ({
  generateEssayContent: jest.fn().mockResolvedValue('Mocked essay content')
}));

const app = express();
app.use(bodyParser.json());

app.post('/api/generateEssay', generateEssay);

describe('GPT API Integration', () => {
  it('should generate an essay based on prompts', async () => {
    const response = await request(app)
      .post('/api/generateEssay')
      .send({ prompt1: 'Prompt 1', prompt2: 'Prompt 2', prompt3: 'Prompt 3' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('essay');
    expect(response.body.essay).toBe('Mocked essay content');
  });
});






