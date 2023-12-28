const request = require('supertest');
const app = require('../server');
const { generateEssayContent } = require('../openaiService');
const { closeDatabase } = require('../database'); // Ensure this function is exported from your database.js
const authMiddleware = require('../authMiddleware');

jest.mock('../openaiService');
jest.mock('../authMiddleware');
jest.mock('../database');

describe('generateEssayWithSelections endpoint', () => {
  let server;

  beforeAll((done) => {
    server = app.listen(3001, done); // Use a different port if 3001 is already in use
  });

  afterAll(async () => {
    await server.close(); // Close the server to clean up any open handles
    await closeDatabase(); // Ensure the database connection is closed
  });

  it('should generate essay with content from saved pages', async () => {
    const premises = "User entered premises."; // Mock premises
    const urls = ["http://example.com/page1", "http://example.com/page2"]; // Mock URLs

    // Mock implementation of getContentFromURLs
    const getContentFromURLs = jest.fn(async (urls) => {
      return "Mocked content from URLs";
    });

    // Mock implementation of authMiddleware to bypass actual authentication
    authMiddleware.mockImplementation((req, res, next) => {
      req.userId = 'mock-uuid';
      next();
    });

    // Mock implementation of generateEssayContent
    generateEssayContent.mockImplementation(async (prompts, contentFromPages) => {
      return "Generated essay with the provided content";
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
