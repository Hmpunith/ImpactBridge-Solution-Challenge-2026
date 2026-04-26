/**
 * @fileoverview API and Security tests for ImpactBridge.
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js';

describe('API Endpoints', () => {
  it('GET /api/health returns healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('impactbridge');
    expect(res.body).toHaveProperty('requestId');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('POST /api/extract-needs rejects empty body', async () => {
    const res = await request(app)
      .post('/api/extract-needs')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/extract-needs rejects empty text', async () => {
    const res = await request(app)
      .post('/api/extract-needs')
      .send({ text: '' });
    expect(res.status).toBe(400);
  });

  it('POST /api/match-volunteers rejects missing needs', async () => {
    const res = await request(app)
      .post('/api/match-volunteers')
      .send({ volunteers: [{ name: 'Test' }] });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/match-volunteers rejects missing volunteers', async () => {
    const res = await request(app)
      .post('/api/match-volunteers')
      .send({ needs: [{ title: 'Test' }] });
    expect(res.status).toBe(400);
  });

  it('POST /api/impact-report rejects missing data', async () => {
    const res = await request(app)
      .post('/api/impact-report')
      .send({});
    expect(res.status).toBe(400);
  });
});

describe('Security Headers', () => {
  it('should include X-Request-Id header', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-request-id']).toBeDefined();
  });

  it('should include Content-Security-Policy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['content-security-policy']).toBeDefined();
  });

  it('should include X-Content-Type-Options', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('should include Permissions-Policy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['permissions-policy']).toBeDefined();
    expect(res.headers['permissions-policy']).toContain('camera=()');
  });

  it('should include Referrer-Policy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });

  it('should include X-Frame-Options', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
  });
});

describe('Input Validation', () => {
  it('rejects non-string text input', async () => {
    const res = await request(app)
      .post('/api/extract-needs')
      .send({ text: 12345 });
    expect(res.status).toBe(400);
  });

  it('rejects non-array needs input', async () => {
    const res = await request(app)
      .post('/api/match-volunteers')
      .send({ needs: 'not-array', volunteers: [] });
    expect(res.status).toBe(400);
  });

  it('rejects non-object impact data', async () => {
    const res = await request(app)
      .post('/api/impact-report')
      .send({ data: 'string' });
    expect(res.status).toBe(400);
  });
});
