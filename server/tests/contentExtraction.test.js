const request = require('supertest');
const app = require('../server');

// Enhanced Mock for node-fetch
jest.mock('node-fetch', () => {
  const fetchMock = jest.fn((url) =>
    Promise.resolve({
      status: 200,
      headers: {
        get: jest.fn((header) => {
          if (header === 'content-type') {
            return 'text/html';
          }
        }),
      },
      text: () => Promise.resolve('<html><body><p>Fake article content for ' + url + '</p></body></html>'),
    })
  );
  return fetchMock;
});

// Mock authMiddleware
jest.mock('../authMiddleware', () => {
  return jest.fn((req, res, next) => {
    req.userId = 'mock-uuid'; // Assign a mock userId for the test cases
    next();
  });
});

// Mock openaiService
jest.mock('../openaiService', () => ({
  generateEssayContent: jest.fn().mockResolvedValue('Mocked essay content')
}));

describe('Content Extraction for Essay Generation', () => {
  test('should generate an essay with provided URLs', async () => {
    // Change this to an array of strings
    const mockPremises = ['This is a test premise for the essay.'];

    const mockUrls = ['https://example.com/article1', 'https://example.com/article2'];

    const response = await request(app)
      .post('/api/generateEssayWithSelections')
      .send({ premises: mockPremises, urls: mockUrls });

    // The rest of your test assertions
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('essay');
    expect(response.body.essay).toBe('Mocked essay content');
  }, 30000);
});




