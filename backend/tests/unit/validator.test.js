/**
 * @file validator.test.js
 * @description Unit tests for express-validator middleware schemas and BVA.
 */
const express = require('express');
const request = require('supertest');
const {
  validateRegistration,
  validateLogin,
  validateRating,
  validateAttendance,
  validateComplaint,
  validateMenu,
} = require('../../src/middleware/validator');

describe('Validation Middleware & BVA Unit Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    app.post('/test/register', validateRegistration, (req, res) => res.json({ success: true }));
    app.post('/test/login', validateLogin, (req, res) => res.json({ success: true }));
    app.post('/test/rating', validateRating, (req, res) => res.json({ success: true }));
    app.post('/test/attendance', validateAttendance, (req, res) => res.json({ success: true }));
    app.post('/test/complaint', validateComplaint, (req, res) => res.json({ success: true }));
    app.post('/test/menu', validateMenu, (req, res) => res.json({ success: true }));
  });

  describe('Registration Validator (BVA on Password & Phone)', () => {
    const validPayload = {
      name: 'Rohan Verma',
      email: 'rohan@smartmess.edu',
      password: 'password123',
      roll_number: 'CS2024009',
      hostel_name: 'Aryabhatta Hostel',
      room_number: 'B-101',
      phone_number: '9876543210',
    };

    test('TC-VAL-01: valid registration payload passes', async () => {
      const res = await request(app).post('/test/register').send(validPayload);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('TC-VAL-02: BVA - password with 5 characters fails (< 6)', async () => {
      const res = await request(app)
        .post('/test/register')
        .send({ ...validPayload, password: '12345' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Password must be at least 6 characters long/);
    });

    test('TC-VAL-03: BVA - password with exactly 6 characters passes (min bound)', async () => {
      const res = await request(app)
        .post('/test/register')
        .send({ ...validPayload, password: '123456' });
      expect(res.status).toBe(200);
    });

    test('TC-VAL-04: rejects invalid email address', async () => {
      const res = await request(app)
        .post('/test/register')
        .send({ ...validPayload, email: 'not-an-email' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/valid university email/);
    });

    test('TC-VAL-05: BVA - phone number length boundaries (9 fails, 10 passes, 16 fails)', async () => {
      const res9 = await request(app)
        .post('/test/register')
        .send({ ...validPayload, phone_number: '123456789' });
      expect(res9.status).toBe(400);

      const res10 = await request(app)
        .post('/test/register')
        .send({ ...validPayload, phone_number: '1234567890' });
      expect(res10.status).toBe(200);

      const res16 = await request(app)
        .post('/test/register')
        .send({ ...validPayload, phone_number: '1234567890123456' });
      expect(res16.status).toBe(400);
    });
  });

  describe('Rating Validator (BVA on 1-5 Star Ratings)', () => {
    const validRating = {
      menu_id: '550e8400-e29b-41d4-a716-446655440000',
      meal_type: 'lunch',
      rating: 4,
      comment: 'Delicious meal',
    };

    test('TC-VAL-06: valid rating passes', async () => {
      const res = await request(app).post('/test/rating').send(validRating);
      expect(res.status).toBe(200);
    });

    test('TC-VAL-07: BVA - rating = 0 fails (below lower bound)', async () => {
      const res = await request(app)
        .post('/test/rating')
        .send({ ...validRating, rating: 0 });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Rating must be an integer between 1 and 5/);
    });

    test('TC-VAL-08: BVA - rating = 1 passes (lower bound)', async () => {
      const res = await request(app)
        .post('/test/rating')
        .send({ ...validRating, rating: 1 });
      expect(res.status).toBe(200);
    });

    test('TC-VAL-09: BVA - rating = 5 passes (upper bound)', async () => {
      const res = await request(app)
        .post('/test/rating')
        .send({ ...validRating, rating: 5 });
      expect(res.status).toBe(200);
    });

    test('TC-VAL-10: BVA - rating = 6 fails (above upper bound)', async () => {
      const res = await request(app)
        .post('/test/rating')
        .send({ ...validRating, rating: 6 });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Rating must be an integer between 1 and 5/);
    });

    test('TC-VAL-11: rejects non-UUID menu_id', async () => {
      const res = await request(app)
        .post('/test/rating')
        .send({ ...validRating, menu_id: '123-not-uuid' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Valid menu UUID/);
    });
  });

  describe('Attendance & Menu Validators', () => {
    test('TC-VAL-12: rejects invalid meal_type for attendance', async () => {
      const res = await request(app)
        .post('/test/attendance')
        .send({ meal_type: 'brunch' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Meal type must be/);
    });

    test('TC-VAL-13: accepts valid meal_type for attendance', async () => {
      const res = await request(app)
        .post('/test/attendance')
        .send({ meal_type: 'breakfast' });
      expect(res.status).toBe(200);
    });

    test('TC-VAL-14: rejects complaint with empty description', async () => {
      const res = await request(app)
        .post('/test/complaint')
        .send({ title: 'Cold food', description: '' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Description is required/);
    });

    test('TC-VAL-15: rejects menu with non-array meal dishes', async () => {
      const res = await request(app).post('/test/menu').send({
        date: '2024-10-15',
        day: 'Tuesday',
        breakfast: 'Idli', // Not an array!
        lunch: [],
        snacks: [],
        dinner: [],
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Breakfast dishes must be an array/);
    });
  });
});
