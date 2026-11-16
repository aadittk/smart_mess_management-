/**
 * @file admin.test.js
 * @description API integration tests for Administrator operations.
 */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const Student = require('../../src/models/Student');
const Menu = require('../../src/models/Menu');
const Rating = require('../../src/models/Rating');
const Attendance = require('../../src/models/Attendance');
const Complaint = require('../../src/models/Complaint');

const TEST_SECRET = process.env.JWT_SECRET || 'smartmess_super_secure_jwt_secret_key_2024_university_project_auth';

describe('Administrator Operations Integration Tests', () => {
  const adminId = '550e8400-e29b-41d4-a716-446655440099';
  const studentId = '550e8400-e29b-41d4-a716-446655440001';
  const menuId = '550e8400-e29b-41d4-a716-446655440010';
  const complaintId = '550e8400-e29b-41d4-a716-446655440050';

  const adminToken = jwt.sign(
    { id: adminId, email: 'admin@smartmess.edu', role: 'admin' },
    TEST_SECRET
  );

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Admin Dashboard', () => {
    test('TC-INT-ADM-01: GET /api/admin/dashboard returns system stats and recent feeds (200)', async () => {
      jest.spyOn(Student, 'countAll').mockResolvedValue(150);
      jest.spyOn(Student, 'countPending').mockResolvedValue(12);
      jest.spyOn(Rating, 'getAverageRating').mockResolvedValue(4.25);
      jest.spyOn(Complaint, 'countOpen').mockResolvedValue(3);
      jest.spyOn(Rating, 'findAll').mockResolvedValue([]);
      jest.spyOn(Complaint, 'findAll').mockResolvedValue([]);

      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stats.totalStudents).toBe(150);
      expect(res.body.data.stats.pendingVerifications).toBe(12);
      expect(res.body.data.stats.avgRating).toBe(4.25);
    });
  });

  describe('Menu Management & Copy Week', () => {
    test('TC-INT-ADM-02: POST /api/admin/menus creates daily menu (201)', async () => {
      jest.spyOn(Menu, 'findByDate').mockResolvedValue(null);
      jest.spyOn(Menu, 'create').mockResolvedValue({
        id: menuId,
        date: '2024-10-25',
        day: 'Friday',
        breakfast: ['Poha'],
        lunch: ['Rajma', 'Rice'],
        snacks: ['Biscuits'],
        dinner: ['Roti', 'Sabzi'],
      });

      const res = await request(app)
        .post('/api/admin/menus')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          date: '2024-10-25',
          day: 'Friday',
          breakfast: ['Poha'],
          lunch: ['Rajma', 'Rice'],
          snacks: ['Biscuits'],
          dinner: ['Roti', 'Sabzi'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.date).toBe('2024-10-25');
    });

    test('TC-INT-ADM-03: PUT /api/admin/menus/:id updates dishes after drag-and-drop (200)', async () => {
      jest.spyOn(Menu, 'findById').mockResolvedValue({ id: menuId });
      jest.spyOn(Menu, 'update').mockResolvedValue({
        id: menuId,
        lunch: ['Reordered Dish 1', 'Reordered Dish 2'],
      });

      const res = await request(app)
        .put(`/api/admin/menus/${menuId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          lunch: ['Reordered Dish 1', 'Reordered Dish 2'],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.lunch[0]).toBe('Reordered Dish 1');
    });

    test('TC-INT-ADM-04: POST /api/admin/menus/copy-week duplicates 7 days to target week (200)', async () => {
      jest.spyOn(Menu, 'copyWeek').mockResolvedValue([
        { date: '2024-10-21' },
        { date: '2024-10-22' },
        { date: '2024-10-23' },
        { date: '2024-10-24' },
        { date: '2024-10-25' },
        { date: '2024-10-26' },
        { date: '2024-10-27' },
      ]);

      const res = await request(app)
        .post('/api/admin/menus/copy-week')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          from_week_start: '2024-10-14',
          to_week_start: '2024-10-21',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/Successfully duplicated 7 daily menus/i);
    });

    test('TC-INT-ADM-05: DELETE /api/admin/menus/:id removes menu (200)', async () => {
      jest.spyOn(Menu, 'findById').mockResolvedValue({ id: menuId });
      jest.spyOn(Menu, 'delete').mockResolvedValue({ id: menuId });

      const res = await request(app)
        .delete(`/api/admin/menus/${menuId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Student Directory & Account Verification', () => {
    test('TC-INT-ADM-06: PUT /api/admin/students/:id/verify approves pending student (200)', async () => {
      jest.spyOn(Student, 'findById').mockResolvedValue({
        id: studentId,
        name: 'Aarav Sharma',
        roll_number: 'CS2024001',
      });
      jest.spyOn(Student, 'updateVerification').mockResolvedValue({
        id: studentId,
        is_verified: true,
      });

      const res = await request(app)
        .put(`/api/admin/students/${studentId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/verified successfully/i);
    });

    test('TC-INT-ADM-07: PUT /api/admin/students/:id/block blocks student (200)', async () => {
      jest.spyOn(Student, 'findById').mockResolvedValue({
        id: studentId,
        name: 'Aarav Sharma',
      });
      jest.spyOn(Student, 'updateBlockedStatus').mockResolvedValue({
        id: studentId,
        is_blocked: true,
      });

      const res = await request(app)
        .put(`/api/admin/students/${studentId}/block`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/blocked successfully/i);
    });

    test('TC-INT-ADM-08: PUT /api/admin/students/:id/unblock unblocks student (200)', async () => {
      jest.spyOn(Student, 'findById').mockResolvedValue({
        id: studentId,
        name: 'Aarav Sharma',
      });
      jest.spyOn(Student, 'updateBlockedStatus').mockResolvedValue({
        id: studentId,
        is_blocked: false,
      });

      const res = await request(app)
        .put(`/api/admin/students/${studentId}/unblock`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/unblocked successfully/i);
    });

    test('TC-INT-ADM-09: DELETE /api/admin/students/:id removes student (200)', async () => {
      jest.spyOn(Student, 'findById').mockResolvedValue({ id: studentId });
      jest.spyOn(Student, 'delete').mockResolvedValue({ id: studentId });

      const res = await request(app)
        .delete(`/api/admin/students/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Complaints Redressal & Attendance CSV', () => {
    test('TC-INT-ADM-10: PUT /api/admin/complaints/:id responds to grievance and updates status (200)', async () => {
      jest.spyOn(Complaint, 'findById').mockResolvedValue({ id: complaintId });
      jest.spyOn(Complaint, 'updateStatus').mockResolvedValue({
        id: complaintId,
        status: 'resolved',
        admin_response: 'Action taken with catering staff.',
      });

      const res = await request(app)
        .put(`/api/admin/complaints/${complaintId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'resolved',
          admin_response: 'Action taken with catering staff.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('resolved');
      expect(res.body.data.admin_response).toBe('Action taken with catering staff.');
    });

    test('TC-INT-ADM-11: GET /api/admin/attendance/export-csv streams CSV content (200)', async () => {
      jest.spyOn(Attendance, 'getReport').mockResolvedValue({
        records: [
          {
            date: '2024-10-15',
            breakfast: true,
            lunch: true,
            snacks: false,
            dinner: true,
            created_at: '2024-10-15T08:00:00Z',
            students: {
              name: 'Aarav Sharma',
              roll_number: 'CS2024001',
              hostel_name: 'Aryabhatta',
              room_number: 'B-204',
            },
          },
        ],
        summary: { totalRecords: 1 },
      });

      const res = await request(app)
        .get('/api/admin/attendance/export-csv')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/csv/);
      expect(res.headers['content-disposition']).toMatch(/attachment; filename=/);
      expect(res.text).toContain('Aarav Sharma');
      expect(res.text).toContain('CS2024001');
    });

    test('TC-INT-ADM-12: GET /api/admin/analytics/summary returns meal scores, dish rankings, and forecast (200)', async () => {
      jest.spyOn(Rating, 'getMealAverages').mockResolvedValue({
        breakfast: 4.2,
        lunch: 4.5,
        snacks: 3.8,
        dinner: 4.0,
      });
      jest.spyOn(Rating, 'getTopAndBottomDishes').mockResolvedValue({
        topDishes: [{ dish: 'Paneer Butter Masala', average: 4.8, ratingsCount: 20 }],
        bottomDishes: [{ dish: 'Karela Sabzi', average: 2.1, ratingsCount: 15 }],
      });
      jest.spyOn(Attendance, 'getAttendanceTrends').mockResolvedValue([]);
      jest.spyOn(Attendance, 'getMovingAverageForecast').mockResolvedValue({
        forecastDate: '2024-10-16',
        forecastTotal: 180,
        forecastMealWise: { breakfast: 140, lunch: 175, snacks: 120, dinner: 165 },
        historicalBasisDays: 7,
      });

      const res = await request(app)
        .get('/api/admin/analytics/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.mealRatings.lunch).toBe(4.5);
      expect(res.body.data.topDishes[0].dish).toBe('Paneer Butter Masala');
      expect(res.body.data.forecast.forecastTotal).toBe(180);
    });
  });
});
