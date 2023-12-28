const request = require('supertest');
const app = require('../server');
const { generateEssayContent } = require('../openaiService');
const authMiddleware = require('../authMiddleware');
const { closeDatabase } = require('../database'); // You might need to implement this function

jest.mock('../openaiService'); // Mock the openaiService
jest.mock('../authMiddleware'); // Mock the authMiddleware

// Mock getContentFromURLs function
const getContentFromURLs = jest.fn(async (urls) => {
  return "Mocked content from URLs";
});

// This is where we mock the actual implementation
generateEssayContent.mockImplementation(async (prompts, contentFromPages) => {
  return "Generated essay with the provided content";
});

describe('generateEssayWithSelections endpoint', () => {
    let server;
  
    // Start your server before the tests run
    beforeAll(() => {
      server = app.listen(3001); // Or another port that you're using for testing
    });
  
    // Close your server after the tests run
    afterAll(async () => {
      await server.close(); // This should close the open handle
      await closeDatabase(); // Make sure you close the database connection
    });
  
    it('should generate essay with content from saved pages', async () => {
      const premises = "User entered premises."; // Define premises here
      const urls = ["http://example.com/page1", "http://example.com/page2"];
      // Mock implementation of authMiddleware to bypass actual authentication
      authMiddleware.mockImplementation((req, res, next) => {
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

afterAll(async () => {
    await closeDatabase(); // Ensure you close any open connections
  });
  