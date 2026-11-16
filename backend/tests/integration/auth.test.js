/**
 * @file auth.test.js
 * @description API integration tests for Authentication and Access Control flows.
 */
const request = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const Student = require('../../src/models/Student');
const Admin = require('../../src/models/Admin');

const TEST_SECRET = process.env.JWT_SECRET || 'smartmess_super_secure_jwt_secret_key_2024_university_project_auth';

describe('Authentication & Access Control Integration Tests', () => {
  const dummyHash = bcrypt.hashSync('Password@123', 10);

  const mockVerifiedStudent = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Aarav Sharma',
    email: 'aarav@smartmess.edu',
    password: dummyHash,
    roll_number: 'CS2024001',
    hostel_name: 'Aryabhatta Hostel',
    room_number: 'B-204',
    phone_number: '9876543210',
    is_verified: true,
    is_blocked: false,
    role: 'student',
  };

  const mockUnverifiedStudent = {
    ...mockVerifiedStudent,
    id: '550e8400-e29b-41d4-a716-446655440002',
    email: 'unverified@smartmess.edu',
    roll_number: 'CS2024002',
    is_verified: false,
  };

  const mockBlockedStudent = {
    ...mockVerifiedStudent,
    id: '550e8400-e29b-41d4-a716-446655440003',
    email: 'blocked@smartmess.edu',
    roll_number: 'CS2024003',
    is_blocked: true,
  };

  const mockAdmin = {
    id: '550e8400-e29b-41d4-a716-446655440099',
    name: 'Chief Warden',
    email: 'admin@smartmess.edu',
    password: dummyHash,
    role: 'admin',
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/auth/register', () => {
    test('TC-INT-AUTH-01: registers new student and sets is_verified=false (201)', async () => {
      jest.spyOn(Student, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(Student, 'findByRollNumber').mockResolvedValue(null);
      jest.spyOn(Student, 'create').mockResolvedValue({
        id: 'new-id',
        name: 'New Student',
        email: 'new@smartmess.edu',
        roll_number: 'CS2024099',
        is_verified: false,
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New Student',
          email: 'new@smartmess.edu',
          password: 'Password@123',
          roll_number: 'CS2024099',
          hostel_name: 'Aryabhatta Hostel',
          room_number: 'B-101',
          phone_number: '9876543210',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.is_verified).toBe(false);
      expect(res.body.message).toMatch(/pending administrator verification/i);
    });

    test('TC-INT-AUTH-02: rejects duplicate university email (409 Conflict)', async () => {
      jest.spyOn(Student, 'findByEmail').mockResolvedValue(mockVerifiedStudent);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Aarav Sharma',
          email: 'aarav@smartmess.edu',
          password: 'Password@123',
          roll_number: 'CS2024999',
          hostel_name: 'Aryabhatta Hostel',
          room_number: 'B-101',
          phone_number: '9876543210',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    test('TC-INT-AUTH-03: rejects duplicate roll number (409 Conflict)', async () => {
      jest.spyOn(Student, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(Student, 'findByRollNumber').mockResolvedValue(mockVerifiedStudent);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Roll',
          email: 'unique@smartmess.edu',
          password: 'Password@123',
          roll_number: 'CS2024001',
          hostel_name: 'Aryabhatta Hostel',
          room_number: 'B-101',
          phone_number: '9876543210',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/roll number is already registered/i);
    });
  });

  describe('POST /api/auth/login', () => {
    test('TC-INT-AUTH-04: authenticates verified, unblocked student and returns signed JWT (200)', async () => {
      jest.spyOn(Student, 'findByEmail').mockResolvedValue(mockVerifiedStudent);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'aarav@smartmess.edu',
          password: 'Password@123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('student');

      const decoded = jwt.verify(res.body.data.token, TEST_SECRET);
      expect(decoded.id).toBe(mockVerifiedStudent.id);
      expect(decoded.role).toBe('student');
    });

    test('TC-INT-AUTH-05: rejects invalid password (401 Unauthorized)', async () => {
      jest.spyOn(Student, 'findByEmail').mockResolvedValue(mockVerifiedStudent);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'aarav@smartmess.edu',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid email or password/i);
    });

    test('TC-INT-AUTH-06: rejects unverified student login (403 Forbidden)', async () => {
      jest.spyOn(Student, 'findByEmail').mockResolvedValue(mockUnverifiedStudent);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unverified@smartmess.edu',
          password: 'Password@123',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/pending administrator verification/i);
    });

    test('TC-INT-AUTH-07: rejects blocked student login (403 Forbidden)', async () => {
      jest.spyOn(Student, 'findByEmail').mockResolvedValue(mockBlockedStudent);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'blocked@smartmess.edu',
          password: 'Password@123',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/suspended by the mess administrator/i);
    });
  });

  describe('POST /api/auth/admin/login', () => {
    test('TC-INT-AUTH-08: authenticates administrator and returns admin JWT (200)', async () => {
      jest.spyOn(Admin, 'findByEmail').mockResolvedValue(mockAdmin);

      const res = await request(app)
        .post('/api/auth/admin/login')
        .send({
          email: 'admin@smartmess.edu',
          password: 'Password@123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('admin');

      const decoded = jwt.verify(res.body.data.token, TEST_SECRET);
      expect(decoded.role).toBe('admin');
    });

    test('TC-INT-AUTH-09: rejects non-existent administrator account (401)', async () => {
      jest.spyOn(Admin, 'findByEmail').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/admin/login')
        .send({
          email: 'fakeadmin@smartmess.edu',
          password: 'Password@123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    test('TC-INT-AUTH-10: returns profile for authenticated student', async () => {
      const studentToken = jwt.sign(
        { id: mockVerifiedStudent.id, role: 'student' },
        TEST_SECRET
      );
      jest.spyOn(Student, 'findById').mockResolvedValue(mockVerifiedStudent);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(mockVerifiedStudent.email);
    });

    test('TC-INT-AUTH-11: returns profile for authenticated admin', async () => {
      const adminToken = jwt.sign(
        { id: mockAdmin.id, role: 'admin' },
        TEST_SECRET
      );
      jest.spyOn(Admin, 'findById').mockResolvedValue(mockAdmin);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('admin');
    });
  });
});
