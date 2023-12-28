const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { generateEssay } = require('./routes'); // Adjust the path as needed

const app = express();
app.use(cors());
app.use(express.json());

jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Mocked essay content' } }]
        })
      }
    }
  }))
}));

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

