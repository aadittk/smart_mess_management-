/**
 * @file authMiddleware.test.js
 * @description Unit tests for JWT verification middleware.
 */
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../../src/middleware/auth');

const TEST_SECRET = process.env.JWT_SECRET || 'smartmess_super_secure_jwt_secret_key_2024_university_project_auth';

describe('Auth Middleware Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  test('TC-MW-01: rejects request when Authorization header is absent (401)', () => {
    verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringMatching(/No authorization token provided/),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('TC-MW-02: rejects request when Authorization header does not start with Bearer (401)', () => {
    req.headers.authorization = 'Basic token123';
    verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('TC-MW-03: rejects malformed or invalid JWT token (401)', () => {
    req.headers.authorization = 'Bearer invalid.token.payload';
    verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Invalid authorization token.',
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('TC-MW-04: rejects expired JWT token (401)', () => {
    const expiredToken = jwt.sign(
      { id: '123', role: 'student' },
      TEST_SECRET,
      { expiresIn: '-1s' }
    );
    req.headers.authorization = `Bearer ${expiredToken}`;
    verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringMatching(/Session expired/),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('TC-MW-05: passes valid token, attaches decoded user, calls next()', () => {
    const validToken = jwt.sign(
      { id: 'usr-1', email: 'test@smartmess.edu', role: 'student' },
      TEST_SECRET,
      { expiresIn: '1h' }
    );
    req.headers.authorization = `Bearer ${validToken}`;

    verifyToken(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe('usr-1');
    expect(req.user.email).toBe('test@smartmess.edu');
    expect(req.user.role).toBe('student');
  });
});
