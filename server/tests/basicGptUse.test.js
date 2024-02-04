const request = require('supertest');
const express = require('express');
const { generateEssayWithSelections } = require('../routes');
const bodyParser = require('body-parser');

jest.mock('../openaiService', () => ({
  generateEssayContent: jest.fn().mockResolvedValue('Mocked essay content')
}));

const app = express();
app.use(bodyParser.json());

app.post('/api/generateEssayWithSelections', generateEssayWithSelections);

describe('GPT API Integration', () => {
  it('should generate an essay based on prompts', async () => {
    const response = await request(app)
      .post('/api/generateEssayWithSelections')
      .send({ 
        urls: ['https://example.com/article1', 'https://example.com/article2'],
        thesis: 'This is a thesis statement',
        bodyPremises: ['This is a test premise for the essay.'],
        missingCitations: [] // Assuming implementation can handle an empty array
      });
  
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('essay');
    expect(response.body.essay).toBe('Mocked essay content');
  });
});








