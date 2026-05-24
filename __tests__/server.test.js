const request = require('supertest');
const app = require('../server');

describe('API Tests', () => {
  test('POST /compare with valid body returns 200 and correct MatchResult shape', async () => {
    const response = await request(app)
      .post('/compare')
      .send({ source: 'hello world', candidate: 'hello world' });

    expect(response.status).toBe(200);
    expect(response.type).toMatch(/json/);
    
    expect(response.body).toHaveProperty('score');
    expect(typeof response.body.score).toBe('number');
    
    expect(response.body).toHaveProperty('strategies');
    expect(response.body.strategies).toHaveProperty('exact');
    expect(response.body.strategies).toHaveProperty('tokenOverlap');
    
    expect(response.body).toHaveProperty('matchedTokens');
    expect(Array.isArray(response.body.matchedTokens)).toBe(true);
    
    expect(response.body).toHaveProperty('processingMs');
    expect(typeof response.body.processingMs).toBe('number');
  });

  test('POST /compare with missing fields returns 400', async () => {
    const response = await request(app)
      .post('/compare')
      .send({ source: 'hello world' }); // missing candidate

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Missing source or candidate fields');
  });

  test('POST /compare with invalid types returns 400', async () => {
    const response = await request(app)
      .post('/compare')
      .send({ source: 'hello world', candidate: 12345 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Source and candidate must be strings');
  });

  test('POST /compare with strings exceeding 5000 characters returns 400', async () => {
    const response = await request(app)
      .post('/compare')
      .send({ source: 'a'.repeat(5001), candidate: 'hello world' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Strings must not exceed 5000 characters');
  });

  test('GET /health returns 200 with { status: "ok" }', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
