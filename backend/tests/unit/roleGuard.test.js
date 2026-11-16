/**
 * @file roleGuard.test.js
 * @description Unit tests for Role Guard authorization middleware.
 */
const { roleGuard, adminOnly, studentOnly } = require('../../src/middleware/roleGuard');

describe('Role Guard Middleware Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  test('TC-ROLE-01: returns 401 when req.user is undefined', () => {
    adminOnly(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Authentication required.',
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('TC-ROLE-02: returns 403 Forbidden when student tries to access admin-only route', () => {
    req.user = { id: 's1', role: 'student' };
    adminOnly(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringMatching(/Forbidden/),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('TC-ROLE-03: returns 403 Forbidden when admin tries to access student-only route', () => {
    req.user = { id: 'a1', role: 'admin' };
    studentOnly(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('TC-ROLE-04: allows admin to access admin-only route', () => {
    req.user = { id: 'a1', role: 'admin' };
    adminOnly(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('TC-ROLE-05: allows student to access student-only route', () => {
    req.user = { id: 's1', role: 'student' };
    studentOnly(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('TC-ROLE-06: custom roleGuard accepts multiple roles', () => {
    const multiGuard = roleGuard('admin', 'student');

    req.user = { id: 's1', role: 'student' };
    multiGuard(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);

    req.user = { id: 'a1', role: 'admin' };
    multiGuard(req, res, next);
    expect(next).toHaveBeenCalledTimes(2);

    req.user = { id: 'g1', role: 'guest' };
    multiGuard(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
