/**
 * @file security.test.js
 * @description Integration tests for cross-cutting security boundaries, role enforcement, and health check.
 */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');

const TEST_SECRET = process.env.JWT_SECRET || 'smartmess_super_secure_jwt_secret_key_2024_university_project_auth';

describe('Security & Cross-Cutting Integration Tests', () => {
  const studentToken = jwt.sign(
    { id: 'stud-1', email: 'student@smartmess.edu', role: 'student' },
    TEST_SECRET
  );

  const adminToken = jwt.sign(
    { id: 'adm-1', email: 'admin@smartmess.edu', role: 'admin' },
    TEST_SECRET
  );

  describe('Role-Based Boundary Guards', () => {
    test('TC-SEC-01: unauthenticated requests to /api/student/* are rejected (401)', async () => {
      const res = await request(app).get('/api/student/menu/today');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/No authorization token provided/i);
    });

    test('TC-SEC-02: unauthenticated requests to /api/admin/* are rejected (401)', async () => {
      const res = await request(app).get('/api/admin/dashboard');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('TC-SEC-03: student token cannot access administrative endpoints (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Forbidden: Access requires \[admin\] privileges/i);
    });

    test('TC-SEC-04: admin token cannot access student-specific operational endpoints (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/student/menu/today')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Forbidden: Access requires \[student\] privileges/i);
    });
  });

  describe('Health & Global Diagnostics', () => {
    test('TC-SEC-05: GET /api/health returns system uptime and status (200)', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/SmartMess API is fully operational/i);
      expect(res.body.uptime).toBeDefined();
      expect(res.body.timestamp).toBeDefined();
    });

    test('TC-SEC-06: returns 404 for unknown endpoints', async () => {
      const res = await request(app).get('/api/non-existent-endpoint');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Endpoint GET \/api\/non-existent-endpoint not found/i);
    });
  });
});
