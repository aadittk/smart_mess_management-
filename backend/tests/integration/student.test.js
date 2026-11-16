/**
 * @file student.test.js
 * @description API integration tests for Student operations (menus, ratings, attendance, complaints).
 */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const Menu = require('../../src/models/Menu');
const Rating = require('../../src/models/Rating');
const Attendance = require('../../src/models/Attendance');
const Complaint = require('../../src/models/Complaint');
const Student = require('../../src/models/Student');
const timeUtils = require('../../src/utils/timeWindows');

const TEST_SECRET = process.env.JWT_SECRET || 'smartmess_super_secure_jwt_secret_key_2024_university_project_auth';

describe('Student Operations Integration Tests', () => {
  const studentId = '550e8400-e29b-41d4-a716-446655440001';
  const otherStudentId = '550e8400-e29b-41d4-a716-446655440002';
  const menuId = '550e8400-e29b-41d4-a716-446655440010';
  const ratingId = '550e8400-e29b-41d4-a716-446655440020';

  const studentToken = jwt.sign(
    { id: studentId, email: 'student@smartmess.edu', role: 'student' },
    TEST_SECRET
  );

  const mockMenu = {
    id: menuId,
    date: new Date().toISOString().split('T')[0],
    day: 'Monday',
    breakfast: ['Poha', 'Boiled Eggs', 'Tea'],
    lunch: ['Dal Makhani', 'Rice', 'Paneer'],
    snacks: ['Samosa', 'Chai'],
    dinner: ['Mix Veg', 'Roti', 'Kheer'],
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Menu Operations', () => {
    test('TC-INT-STU-01: GET /api/student/menu/today returns menu with activeMeal and window schedule (200)', async () => {
      jest.spyOn(Menu, 'findByDate').mockResolvedValue(mockMenu);
      jest.spyOn(Rating, 'findByStudent').mockResolvedValue([]);

      const res = await request(app)
        .get('/api/student/menu/today')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.menu.id).toBe(menuId);
      expect(res.body.data.mealWindows).toBeDefined();
    });

    test('TC-INT-STU-02: GET /api/student/menu/weekly returns 7-day array of menus (200)', async () => {
      jest.spyOn(Menu, 'findByDateRange').mockResolvedValue([mockMenu]);

      const res = await request(app)
        .get('/api/student/menu/weekly?start_date=2024-10-14')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.menus)).toBe(true);
    });
  });

  describe('Rating Operations & Uniqueness Constraints', () => {
    test('TC-INT-STU-03: POST /api/student/ratings submits 1-5 star review (201)', async () => {
      jest.spyOn(Rating, 'findByStudentAndMenuMeal').mockResolvedValue(null);
      jest.spyOn(Rating, 'create').mockResolvedValue({
        id: ratingId,
        student_id: studentId,
        menu_id: menuId,
        meal_type: 'lunch',
        rating: 5,
        comment: 'Fresh and tasty!',
      });

      const res = await request(app)
        .post('/api/student/ratings')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          menu_id: menuId,
          meal_type: 'lunch',
          rating: 5,
          comment: 'Fresh and tasty!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating).toBe(5);
    });

    test('TC-INT-STU-04: POST /api/student/ratings rejects duplicate rating for same meal (409 Conflict)', async () => {
      // Simulate existing rating found for today's lunch
      jest.spyOn(Rating, 'findByStudentAndMenuMeal').mockResolvedValue({
        id: ratingId,
        student_id: studentId,
        menu_id: menuId,
        meal_type: 'lunch',
        rating: 4,
      });

      const res = await request(app)
        .post('/api/student/ratings')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          menu_id: menuId,
          meal_type: 'lunch',
          rating: 3,
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already submitted a rating for this lunch/i);
    });

    test('TC-INT-STU-05: PUT /api/student/ratings/:id updates existing rating (200)', async () => {
      jest.spyOn(Rating, 'findById').mockResolvedValue({
        id: ratingId,
        student_id: studentId,
        rating: 4,
      });
      jest.spyOn(Rating, 'update').mockResolvedValue({
        id: ratingId,
        student_id: studentId,
        rating: 5,
        comment: 'Updated review',
      });

      const res = await request(app)
        .put(`/api/student/ratings/${ratingId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          rating: 5,
          comment: 'Updated review',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating).toBe(5);
    });

    test('TC-INT-STU-06: PUT /api/student/ratings/:id rejects modifying other students ratings (403)', async () => {
      jest.spyOn(Rating, 'findById').mockResolvedValue({
        id: ratingId,
        student_id: otherStudentId, // owned by someone else!
      });

      const res = await request(app)
        .put(`/api/student/ratings/${ratingId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ rating: 2 });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test('TC-INT-STU-07: DELETE /api/student/ratings/:id deletes user rating (200)', async () => {
      jest.spyOn(Rating, 'findById').mockResolvedValue({
        id: ratingId,
        student_id: studentId,
      });
      jest.spyOn(Rating, 'delete').mockResolvedValue({ id: ratingId });

      const res = await request(app)
        .delete(`/api/student/ratings/${ratingId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Attendance Operations & Time Window Enforcement', () => {
    test('TC-INT-STU-08: POST /api/student/attendance rejects check-in outside meal time window (400)', async () => {
      // Mock window check returning invalid (e.g. at 15:30 for lunch)
      jest.spyOn(timeUtils, 'isWithinMealWindow').mockReturnValue({
        valid: false,
        message: 'Attendance for lunch can only be marked between 12:00 and 14:30.',
      });

      const res = await request(app)
        .post('/api/student/attendance')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ meal_type: 'lunch' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/between 12:00 and 14:30/i);
    });

    test('TC-INT-STU-09: POST /api/student/attendance marks attendance when inside time window (200)', async () => {
      jest.spyOn(timeUtils, 'isWithinMealWindow').mockReturnValue({ valid: true });
      jest.spyOn(Attendance, 'markMeal').mockResolvedValue({
        id: 'att-1',
        student_id: studentId,
        date: new Date().toISOString().split('T')[0],
        lunch: true,
      });

      const res = await request(app)
        .post('/api/student/attendance')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ meal_type: 'lunch' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/Attendance marked successfully for lunch/i);
    });

    test('TC-INT-STU-10: POST /api/student/attendance rejects duplicate meal check-in today (409 Conflict)', async () => {
      jest.spyOn(timeUtils, 'isWithinMealWindow').mockReturnValue({ valid: true });
      const dupError = new Error('Attendance for lunch has already been marked for today.');
      dupError.statusCode = 409;
      jest.spyOn(Attendance, 'markMeal').mockRejectedValue(dupError);

      const res = await request(app)
        .post('/api/student/attendance')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ meal_type: 'lunch' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already been marked/i);
    });

    test('TC-INT-STU-11: GET /api/student/attendance returns today status and monthly logs (200)', async () => {
      jest.spyOn(Attendance, 'findByStudentAndDate').mockResolvedValue({
        id: 'att-1',
        student_id: studentId,
        breakfast: true,
        lunch: false,
        snacks: false,
        dinner: false,
      });
      jest.spyOn(Attendance, 'findByStudent').mockResolvedValue([]);

      const res = await request(app)
        .get('/api/student/attendance?month=10&year=2024')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.today.breakfast).toBe(true);
    });
  });

  describe('Complaints & Profile Operations', () => {
    test('TC-INT-STU-12: POST /api/student/complaints lodges new grievance (201)', async () => {
      jest.spyOn(Complaint, 'create').mockResolvedValue({
        id: 'comp-1',
        student_id: studentId,
        title: 'Water dispenser empty',
        description: 'First floor dispenser was empty during lunch',
        status: 'pending',
      });

      const res = await request(app)
        .post('/api/student/complaints')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Water dispenser empty',
          description: 'First floor dispenser was empty during lunch',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('pending');
    });

    test('TC-INT-STU-13: PUT /api/student/password updates password with correct current password (200)', async () => {
      const bcrypt = require('bcrypt');
      const hash = bcrypt.hashSync('OldPassword@123', 10);
      jest.spyOn(Student, 'findByIdWithPassword').mockResolvedValue({
        id: studentId,
        password: hash,
      });
      jest.spyOn(Student, 'updatePassword').mockResolvedValue({ id: studentId });

      const res = await request(app)
        .put('/api/student/password')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          current_password: 'OldPassword@123',
          new_password: 'NewPassword@456',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/Password changed successfully/i);
    });

    test('TC-INT-STU-14: PUT /api/student/password rejects incorrect current password (401)', async () => {
      const bcrypt = require('bcrypt');
      const hash = bcrypt.hashSync('RealPassword@123', 10);
      jest.spyOn(Student, 'findByIdWithPassword').mockResolvedValue({
        id: studentId,
        password: hash,
      });

      const res = await request(app)
        .put('/api/student/password')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          current_password: 'WrongPassword!',
          new_password: 'NewPassword@456',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Current password is incorrect/i);
    });
  });
});
