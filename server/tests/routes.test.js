const request = require('supertest');
const { app } = require('../server');

// Mock functions to simulate database operations
const mockUpdateOne = jest.fn();
const mockFindOne = jest.fn();

// Mock the database module
jest.mock('../database', () => ({
  connect: jest.fn().mockResolvedValue({
    collection: jest.fn(() => ({
      updateOne: mockUpdateOne,
      findOne: mockFindOne,
    })),
  }),
}));

describe('API routes', () => {
  beforeEach(() => {
    // Clear mock implementations before each test
    mockUpdateOne.mockReset();
    mockFindOne.mockReset();
  });

  test('/saveRecentEssay saves essay data', async () => {
    const mockEssayData = { essay: 'Test Essay', thesis: 'Test Thesis', premises: ['Test Premise'], selections: [] };
    mockUpdateOne.mockResolvedValue({ result: { nModified: 1 } });

    const response = await request(app)
      .post('/api/saveRecentEssay')
      .send(mockEssayData);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toContain('saved successfully');
    expect(mockUpdateOne).toHaveBeenCalled();
  });

  test('/getRecentEssay retrieves essay data', async () => {
    const mockEssayData = { essay: 'Test Essay', thesis: 'Test Thesis', premises: ['Test Premise'], selections: [] };
    mockFindOne.mockResolvedValue({ recentEssay: mockEssayData });

    const response = await request(app)
      .get('/api/getRecentEssay')
      .set('Authorization', 'Bearer test-token');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockEssayData);
    expect(mockFindOne).toHaveBeenCalled();
  });

  test('/clearSelections clears essay data', async () => {
    mockUpdateOne.mockResolvedValue({ result: { nModified: 1 } });

    const response = await request(app)
      .post('/api/clearSelections')
      .set('Authorization', 'Bearer test-token');

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toContain('cleared');
    expect(mockUpdateOne).toHaveBeenCalled();
  });
});