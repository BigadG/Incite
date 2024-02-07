const request = require('supertest');
const { app } = require('./server');
const { connect } = require('./database');

jest.mock('./database', () => ({
  connect: jest.fn().mockResolvedValue({
    collection: jest.fn().mockReturnThis(),
    updateOne: jest.fn(),
    findOne: jest.fn(),
  }),
}));

describe('API routes', () => {
  test('/saveRecentEssay saves essay data', async () => {
    const mockEssayData = { essay: 'Test Essay', thesis: 'Test Thesis', premises: ['Test Premise'], selections: [] };
    connect().collection().updateOne.mockResolvedValue({ result: { nModified: 1 } });

    const response = await request(app)
      .post('/api/saveRecentEssay')
      .send(mockEssayData);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toContain('saved successfully');
  });

  test('/getRecentEssay retrieves essay data', async () => {
    const mockEssayData = { essay: 'Test Essay', thesis: 'Test Thesis', premises: ['Test Premise'], selections: [] };
    connect().collection().findOne.mockResolvedValue({ recentEssay: mockEssayData });

    const response = await request(app)
      .get('/api/getRecentEssay')
      .set('Authorization', 'Bearer test-token');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockEssayData);
  });

  test('/clearSelections clears essay data', async () => {
    connect().collection().updateOne.mockResolvedValue({ result: { nModified: 1 } });

    const response = await request(app)
      .post('/api/clearSelections')
      .set('Authorization', 'Bearer test-token');

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toContain('cleared');
  });
});
