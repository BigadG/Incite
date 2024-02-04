const request = require('supertest');
const app = require('../server');

jest.mock('node-fetch', () => {
  return jest.fn(() => Promise.resolve({
    status: 200,
    headers: {
      get: () => 'text/html'
    },
    text: () => Promise.resolve('<html><body><p>Fake content for testing</p></body></html>')
  }));
});

jest.mock('../authMiddleware', () => {
  return (req, res, next) => {
    req.userId = 'mock-uuid';
    next();
  };
});

jest.mock('../database', () => ({
  connect: () => Promise.resolve({
    collection: () => ({
      findOne: () => Promise.resolve({ uuid: 'mock-uuid', selections: [] }),
      updateOne: () => Promise.resolve({}),
      createIndex: () => Promise.resolve({}),
    }),
  }),
}));

jest.mock('../openaiService', () => ({
  generateEssayContent: jest.fn().mockResolvedValue('Mocked essay content')
}));

describe('GPT API Integration', () => {
  test('should generate an essay based on prompts', async () => {
    const response = await request(app)
      .post('/api/generateEssayWithSelections')
      .send({
        urls: ['https://example.com/article1', 'https://example.com/article2'],
        thesis: 'This is a thesis statement',
        bodyPremises: ['This is a test premise for the essay.'],
        missingCitations: []
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('essay');
    expect(response.body.essay).toBe('Mocked essay content');
  });
});








