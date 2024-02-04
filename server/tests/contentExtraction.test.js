const request = require('supertest');
const app = require('../server');

jest.mock('node-fetch', () => {
  const fetchMock = jest.fn(() =>
    Promise.resolve({
      status: 200,
      headers: {
        get: () => 'text/html',
        // Mock function to simulate the Headers.entries method
        entries: () => [['content-type', 'text/html']],
      },
      text: () => Promise.resolve('<html><body><p>Fake content for testing</p></body></html>'),
    })
  );
  return fetchMock;
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
      updateOne: () => Promise.resolve({ modifiedCount: 1 }),
      createIndex: () => Promise.resolve({}),
    }),
  }),
}));

jest.mock('../openaiService', () => ({
  generateEssayContent: jest.fn().mockResolvedValue('Mocked essay content')
}));

describe('Content Extraction for Essay Generation', () => {
  test('should generate an essay with provided URLs', async () => {
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
  }, 30000);
});
