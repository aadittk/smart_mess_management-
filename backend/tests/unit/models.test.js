/**
 * @file models.test.js
 * @description Comprehensive unit tests for all database models with chainable thenable mock.
 */
const { supabase } = require('../../src/config/database');
const Student = require('../../src/models/Student');
const Admin = require('../../src/models/Admin');
const Menu = require('../../src/models/Menu');
const Rating = require('../../src/models/Rating');
const Attendance = require('../../src/models/Attendance');
const Complaint = require('../../src/models/Complaint');

jest.mock('../../src/config/database', () => {
  const queryMock = {};

  const chainable = () => queryMock;

  queryMock.select = jest.fn(chainable);
  queryMock.insert = jest.fn(chainable);
  queryMock.update = jest.fn(chainable);
  queryMock.delete = jest.fn(chainable);
  queryMock.upsert = jest.fn(chainable);
  queryMock.eq = jest.fn(chainable);
  queryMock.or = jest.fn(chainable);
  queryMock.in = jest.fn(chainable);
  queryMock.gte = jest.fn(chainable);
  queryMock.lte = jest.fn(chainable);
  queryMock.lt = jest.fn(chainable);
  queryMock.order = jest.fn(chainable);
  queryMock.single = jest.fn();
  queryMock.maybeSingle = jest.fn();

  queryMock._resolvedData = [];
  queryMock._resolvedCount = 0;

  // Make queryMock awaitable
  queryMock.then = function (resolve, reject) {
    return Promise.resolve({
      data: queryMock._resolvedData,
      count: queryMock._resolvedCount,
      error: null,
    }).then(resolve, reject);
  };

  return {
    supabase: {
      from: jest.fn(() => queryMock),
      _queryMock: queryMock,
    },
  };
});

describe('Comprehensive Database Models Unit Tests', () => {
  const mock = supabase._queryMock;

  beforeEach(() => {
    jest.clearAllMocks();
    mock._resolvedData = [];
    mock._resolvedCount = 0;
  });

  describe('Student Model Methods', () => {
    test('Student.create inserts and returns record', async () => {
      mock.single.mockResolvedValueOnce({
        data: { id: 's-1', name: 'Aarav', is_verified: false, is_blocked: false },
        error: null,
      });
      const res = await Student.create({
        name: 'Aarav',
        email: 'aarav@smartmess.edu',
        password: 'hash',
        roll_number: 'CS2024001',
        hostel_name: 'Aryabhatta',
        room_number: 'B-204',
        phone_number: '9876543210',
      });
      expect(res.id).toBe('s-1');
      expect(res.is_verified).toBe(false);
    });

    test('Student.findByEmail and findByRollNumber retrieve records', async () => {
      mock.maybeSingle.mockResolvedValueOnce({ data: { id: 's-1', email: 'test@edu' }, error: null });
      const res1 = await Student.findByEmail('test@edu');
      expect(res1.email).toBe('test@edu');

      mock.maybeSingle.mockResolvedValueOnce({ data: { id: 's-1', roll_number: 'CS01' }, error: null });
      const res2 = await Student.findByRollNumber('CS01');
      expect(res2.roll_number).toBe('CS01');
    });

    test('Student.findById and findByIdWithPassword retrieve records', async () => {
      mock.maybeSingle.mockResolvedValueOnce({ data: { id: 's-1', name: 'Aarav' }, error: null });
      const res1 = await Student.findById('s-1');
      expect(res1.name).toBe('Aarav');

      mock.maybeSingle.mockResolvedValueOnce({ data: { id: 's-1', password: 'hash' }, error: null });
      const res2 = await Student.findByIdWithPassword('s-1');
      expect(res2.password).toBe('hash');
    });

    test('Student.findAll with filters (verified, blocked, hostel, search)', async () => {
      mock._resolvedData = [{ id: 's-1', name: 'Aarav' }];

      const res = await Student.findAll({
        verified: true,
        blocked: false,
        hostel: 'Aryabhatta',
        search: 'Aarav',
      });
      expect(mock.eq).toHaveBeenCalledWith('is_verified', true);
      expect(mock.eq).toHaveBeenCalledWith('is_blocked', false);
      expect(mock.eq).toHaveBeenCalledWith('hostel_name', 'Aryabhatta');
      expect(mock.or).toHaveBeenCalled();
      expect(res.length).toBe(1);
    });

    test('Student.updateVerification and updateBlockedStatus update booleans', async () => {
      mock.single.mockResolvedValueOnce({ data: { id: 's-1', is_verified: true }, error: null });
      const res1 = await Student.updateVerification('s-1', true);
      expect(res1.is_verified).toBe(true);

      mock.single.mockResolvedValueOnce({ data: { id: 's-1', is_blocked: true }, error: null });
      const res2 = await Student.updateBlockedStatus('s-1', true);
      expect(res2.is_blocked).toBe(true);
    });

    test('Student.updateProfile and updatePassword update records', async () => {
      mock.single.mockResolvedValueOnce({ data: { id: 's-1', room_number: 'B-205' }, error: null });
      const prof = await Student.updateProfile('s-1', { room_number: 'B-205', phone_number: '9999999999' });
      expect(prof.room_number).toBe('B-205');

      mock.single.mockResolvedValueOnce({ data: { id: 's-1' }, error: null });
      const pwd = await Student.updatePassword('s-1', 'new-hash');
      expect(pwd.id).toBe('s-1');
    });

    test('Student.delete removes student record', async () => {
      mock.single.mockResolvedValueOnce({ data: { id: 's-1' }, error: null });
      const del = await Student.delete('s-1');
      expect(del.id).toBe('s-1');
    });

    test('Student.countAll and countPending return numbers', async () => {
      mock._resolvedCount = 120;
      const count1 = await Student.countAll();
      expect(count1).toBe(120);

      mock._resolvedCount = 5;
      const count2 = await Student.countPending();
      expect(count2).toBe(5);
    });
  });

  describe('Admin Model Methods', () => {
    test('Admin.create and findByEmail retrieve admin', async () => {
      mock.single.mockResolvedValueOnce({ data: { id: 'a-1', role: 'admin' }, error: null });
      const res1 = await Admin.create({ name: 'Warden', email: 'a@edu', password: 'h' });
      expect(res1.role).toBe('admin');

      mock.maybeSingle.mockResolvedValueOnce({ data: { id: 'a-1', email: 'a@edu' }, error: null });
      const res2 = await Admin.findByEmail('a@edu');
      expect(res2.email).toBe('a@edu');

      mock.maybeSingle.mockResolvedValueOnce({ data: { id: 'a-1', name: 'Warden' }, error: null });
      const res3 = await Admin.findById('a-1');
      expect(res3.name).toBe('Warden');
    });
  });

  describe('Menu Model Methods', () => {
    test('Menu.findByDate and findById retrieve menu', async () => {
      mock.maybeSingle.mockResolvedValueOnce({ data: { id: 'm-1', date: '2024-10-15' }, error: null });
      const res1 = await Menu.findByDate('2024-10-15');
      expect(res1.date).toBe('2024-10-15');

      mock.maybeSingle.mockResolvedValueOnce({ data: { id: 'm-1' }, error: null });
      const res2 = await Menu.findById('m-1');
      expect(res2.id).toBe('m-1');
    });

    test('Menu.findByDateRange returns range array', async () => {
      mock._resolvedData = [{ id: 'm-1' }, { id: 'm-2' }];
      const res = await Menu.findByDateRange('2024-10-14', '2024-10-20');
      expect(res.length).toBe(2);
    });

    test('Menu.create, update, upsert, and delete modify records', async () => {
      mock.single.mockResolvedValueOnce({ data: { id: 'm-1' }, error: null });
      const c = await Menu.create({ date: '2024-10-15', day: 'Tue' });
      expect(c.id).toBe('m-1');

      mock.single.mockResolvedValueOnce({ data: { id: 'm-1', day: 'Tue' }, error: null });
      const u = await Menu.update('m-1', {
        breakfast: ['Poha'],
        lunch: ['Rice'],
        snacks: ['Tea'],
        dinner: ['Roti'],
        day: 'Tue',
      });
      expect(u.id).toBe('m-1');

      mock.single.mockResolvedValueOnce({ data: { id: 'm-1' }, error: null });
      const up = await Menu.upsert({ date: '2024-10-15', day: 'Tue' });
      expect(up.id).toBe('m-1');

      mock.single.mockResolvedValueOnce({ data: { id: 'm-1' }, error: null });
      const del = await Menu.delete('m-1');
      expect(del.id).toBe('m-1');
    });

    test('Menu.copyWeek copies 7 days from source to target week', async () => {
      jest.spyOn(Menu, 'findByDateRange').mockResolvedValueOnce([
        { date: '2024-10-14', breakfast: ['Idli'], lunch: ['Rice'], snacks: [], dinner: [] },
      ]);
      jest.spyOn(Menu, 'upsert').mockResolvedValue({ id: 'copied-1' });

      const copied = await Menu.copyWeek('2024-10-14', '2024-10-21');
      expect(copied.length).toBe(1);
    });

    test('Menu.copyWeek throws error when no source menus found', async () => {
      jest.spyOn(Menu, 'findByDateRange').mockResolvedValueOnce([]);
      await expect(Menu.copyWeek('2024-10-14', '2024-10-21')).rejects.toThrow(
        /No menus found in source week/
      );
    });
  });

  describe('Rating Model Methods', () => {
    test('Rating.create, findById, findByStudent retrieve ratings', async () => {
      mock.single.mockResolvedValueOnce({ data: { id: 'r-1', rating: 5 }, error: null });
      const res1 = await Rating.create({
        student_id: 's-1',
        menu_id: 'm-1',
        meal_type: 'lunch',
        rating: 5,
      });
      expect(res1.rating).toBe(5);

      mock.maybeSingle.mockResolvedValueOnce({ data: { id: 'r-1', rating: 5 }, error: null });
      const res2 = await Rating.findById('r-1');
      expect(res2.rating).toBe(5);

      mock._resolvedData = [{ id: 'r-1' }];
      const res3 = await Rating.findByStudent('s-1');
      expect(res3.length).toBe(1);
    });

    test('Rating.findByStudentAndMenuMeal retrieves rating', async () => {
      mock.maybeSingle.mockResolvedValueOnce({ data: { id: 'r-1' }, error: null });
      const res = await Rating.findByStudentAndMenuMeal('s-1', 'm-1', 'lunch');
      expect(res.id).toBe('r-1');
    });

    test('Rating.findAll with filters', async () => {
      mock._resolvedData = [{ id: 'r-1', meal_type: 'lunch', rating: 5 }];
      const res = await Rating.findAll({
        meal_type: 'lunch',
        rating: 5,
        date_from: '2024-10-01',
        date_to: '2024-10-15',
      });
      expect(res.length).toBe(1);
    });

    test('Rating.update and delete modify ratings', async () => {
      mock.single.mockResolvedValueOnce({ data: { id: 'r-1', rating: 3 }, error: null });
      const updated = await Rating.update('r-1', { rating: 3, comment: 'ok' });
      expect(updated.rating).toBe(3);

      mock.single.mockResolvedValueOnce({ data: { id: 'r-1' }, error: null });
      const del = await Rating.delete('r-1');
      expect(del.id).toBe('r-1');
    });

    test('Rating.getAverageRating and getMealAverages calculate stats', async () => {
      mock._resolvedData = [{ rating: 4 }, { rating: 5 }, { rating: 3 }];
      const avg = await Rating.getAverageRating();
      expect(avg).toBe(4.0);

      mock._resolvedData = [
        { meal_type: 'breakfast', rating: 4 },
        { meal_type: 'lunch', rating: 5 },
        { meal_type: 'snacks', rating: 3 },
        { meal_type: 'dinner', rating: 4 },
      ];
      const mealAvg = await Rating.getMealAverages();
      expect(mealAvg.lunch).toBe(5.0);
    });

    test('Rating.getTopAndBottomDishes aggregates ranked dishes', async () => {
      mock._resolvedData = [
        { meal_type: 'lunch', rating: 5, menus: { lunch: ['Paneer Tikka'] } },
        { meal_type: 'dinner', rating: 2, menus: { dinner: ['Karela'] } },
      ];
      const { topDishes, bottomDishes } = await Rating.getTopAndBottomDishes();
      expect(topDishes[0].dish).toBe('Paneer Tikka');
      expect(bottomDishes[0].dish).toBe('Karela');
    });
  });

  describe('Attendance Model Methods', () => {
    test('Attendance.findByStudentAndDate and findByStudent retrieve logs', async () => {
      mock.maybeSingle.mockResolvedValueOnce({ data: { id: 'att-1', lunch: true }, error: null });
      const a = await Attendance.findByStudentAndDate('s-1', '2024-10-15');
      expect(a.lunch).toBe(true);

      mock._resolvedData = [{ id: 'att-1' }];
      const list = await Attendance.findByStudent('s-1', 10, 2024);
      expect(list.length).toBe(1);
    });

    test('Attendance.markMeal inserts new or updates existing', async () => {
      jest.spyOn(Attendance, 'findByStudentAndDate').mockResolvedValueOnce(null);
      mock.single.mockResolvedValueOnce({ data: { id: 'att-1', lunch: true }, error: null });

      const res = await Attendance.markMeal('s-1', '2024-10-15', 'lunch');
      expect(res.lunch).toBe(true);

      jest.spyOn(Attendance, 'findByStudentAndDate').mockResolvedValueOnce({
        id: 'att-1',
        breakfast: false,
      });
      mock.single.mockResolvedValueOnce({ data: { id: 'att-1', breakfast: true }, error: null });

      const res2 = await Attendance.markMeal('s-1', '2024-10-15', 'breakfast');
      expect(res2.breakfast).toBe(true);
    });

    test('Attendance.markMeal throws 409 if meal already marked today', async () => {
      jest.spyOn(Attendance, 'findByStudentAndDate').mockResolvedValueOnce({
        id: 'att-1',
        lunch: true,
      });

      await expect(Attendance.markMeal('s-1', '2024-10-15', 'lunch')).rejects.toThrow(
        /already been marked for today/
      );
    });

    test('Attendance.getReport compiles stats and summary', async () => {
      mock._resolvedData = [
        { breakfast: true, lunch: true, snacks: false, dinner: true },
      ];
      const rep = await Attendance.getReport({ date_from: '2024-10-01', date_to: '2024-10-15' });
      expect(rep.summary.totalRecords).toBe(1);
      expect(rep.summary.lunchCount).toBe(1);
    });

    test('Attendance.getAttendanceTrends and getMovingAverageForecast compute forecasts', async () => {
      mock._resolvedData = [
        { date: '2024-10-14', breakfast: true, lunch: true, snacks: false, dinner: true },
      ];
      const trends = await Attendance.getAttendanceTrends(7);
      expect(trends.length).toBe(1);

      jest.spyOn(Attendance, 'getAttendanceTrends').mockResolvedValueOnce([
        { date: '2024-10-14', breakfast: 50, lunch: 60, snacks: 40, dinner: 50, total: 200 },
      ]);
      const fc = await Attendance.getMovingAverageForecast(7);
      expect(fc.forecastTotal).toBe(200);
    });
  });

  describe('Complaint Model Methods', () => {
    test('Complaint.create, findById, findByStudent, findAll', async () => {
      mock.single.mockResolvedValueOnce({ data: { id: 'c-1', status: 'pending' }, error: null });
      const c1 = await Complaint.create({ student_id: 's-1', title: 'T', description: 'D' });
      expect(c1.status).toBe('pending');

      mock.maybeSingle.mockResolvedValueOnce({ data: { id: 'c-1' }, error: null });
      const c2 = await Complaint.findById('c-1');
      expect(c2.id).toBe('c-1');

      mock._resolvedData = [{ id: 'c-1' }];
      const list1 = await Complaint.findByStudent('s-1');
      expect(list1.length).toBe(1);

      mock._resolvedData = [{ id: 'c-1', status: 'pending' }];
      const list2 = await Complaint.findAll({ status: 'pending' });
      expect(list2.length).toBe(1);
    });

    test('Complaint.updateStatus and countOpen', async () => {
      mock.single.mockResolvedValueOnce({ data: { id: 'c-1', status: 'resolved' }, error: null });
      const u = await Complaint.updateStatus('c-1', { status: 'resolved', admin_response: 'ok' });
      expect(u.status).toBe('resolved');

      mock._resolvedCount = 4;
      const count = await Complaint.countOpen();
      expect(count).toBe(4);
    });
  });
});
