const request = require('supertest');
const app = require('../server');
const { generateEssayContent } = require('../openaiService');
jest.mock('../openaiService'); // Mock the openaiService


// Mock getContentFromURLs function
const getContentFromURLs = jest.fn(async (urls) => {
  return "Mocked content from URLs";
});

// This is where we mock the actual implementation
generateEssayContent.mockImplementation(async (prompts, contentFromPages) => {
  return "Generated essay with the provided content";
});

describe('generateEssayWithSelections endpoint', () => {
  it('should generate essay with content from saved pages', async () => {
    const premises = "User entered premises.";
    const urls = ["http://example.com/page1", "http://example.com/page2"];

    // Mock the authMiddleware to bypass actual authentication
    jest.mock('../authMiddleware', () => (req, res, next) => {
      req.userId = 'mock-uuid';
      next();
    });

    const response = await request(app)
      .post('/api/generateEssayWithSelections')
      .send({ premises, urls })
      .set('Authorization', 'Bearer mock-uuid');

    expect(response.statusCode).toBe(200);
    expect(response.body.essay).toBe("Generated essay with the provided content");
    expect(getContentFromURLs).toHaveBeenCalledWith(urls);
    expect(generateEssayContent).toHaveBeenCalledWith(premises, "Mocked content from URLs");
  });
});
