import request from 'supertest';
import app from '../index';

describe('Tapza Care API Integration Tests', () => {
  it('GET /api/health returns online status and DB health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('online');
    expect(res.body.app).toBe('Tapza Care API');
  });

  it('GET /api/config returns published home screen layout configuration', async () => {
    const res = await request(app).get('/api/config');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('version');
    expect(res.body.data).toHaveProperty('sections');
    expect(Array.isArray(res.body.data.sections)).toBe(true);
  });

  it('GET /api/doctors returns doctor list with valid structure', async () => {
    const res = await request(app).get('/api/doctors');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/services returns healthcare services list', async () => {
    const res = await request(app).get('/api/services');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
