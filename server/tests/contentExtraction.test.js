require('dotenv').config();
const request = require('supertest');
const app = require('../server');

// Mock node-fetch to simulate fetching webpage content without making actual HTTP requests
jest.mock('node-fetch', () => {
  return jest.fn(() =>
    Promise.resolve({
      text: () => Promise.resolve('<html><body><p>Fake article content</p></body></html>'),
    })
  );
});

// Mock authMiddleware to bypass actual authentication for testing
jest.mock('../authMiddleware', () => {
  return jest.fn((req, res, next) => {
    req.userId = 'mock-uuid'; // Assign a mock userId for the test cases
    next();
  });
});

describe('Content Extraction for Essay Generation', () => {
  test('should generate an essay with provided URLs', async () => {
    const mockPremises = 'This is a test premise for the essay.';
    const mockUrls = ['https://example.com/article1', 'https://example.com/article2'];

    const response = await request(app)
      .post('/api/generateEssayWithSelections')
      .send({ premises: mockPremises, urls: mockUrls });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('essay');
  }, 30000);
});

