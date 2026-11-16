/**
 * @file adminController.js
 * @description Controller for mess administrator / warden operations.
 */
const Student = require('../models/Student');
const Menu = require('../models/Menu');
const Rating = require('../models/Rating');
const Attendance = require('../models/Attendance');
const Complaint = require('../models/Complaint');

/**
 * Get Admin Dashboard high-level KPIs and summary widgets.
 */
async function getDashboard(req, res, next) {
  try {
    const totalStudents = await Student.countAll();
    const pendingVerifications = await Student.countPending();
    const avgRating = await Rating.getAverageRating();
    const openComplaints = await Complaint.countOpen();

    const recentRatings = await Rating.findAll({});
    const recentComplaints = await Complaint.findAll({});

    return res.status(200).json({
      success: true,
      message: 'Dashboard metrics retrieved.',
      data: {
        stats: {
          totalStudents,
          pendingVerifications,
          avgRating,
          openComplaints,
        },
        recentRatings: recentRatings.slice(0, 5),
        recentComplaints: recentComplaints.slice(0, 5),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Menus (by date or week range).
 */
async function getMenus(req, res, next) {
  try {
    const { date, week_start } = req.query;

    if (date) {
      const menu = await Menu.findByDate(date);
      return res.status(200).json({
        success: true,
        message: menu ? 'Menu retrieved.' : 'No menu found for specified date.',
        data: menu,
      });
    }

    if (week_start) {
      const start = new Date(week_start);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      const menus = await Menu.findByDateRange(
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0]
      );

      return res.status(200).json({
        success: true,
        message: 'Weekly menus retrieved.',
        data: menus,
      });
    }

    // Default: fetch current month / upcoming 14 days
    const today = new Date();
    const past7 = new Date();
    past7.setDate(today.getDate() - 7);
    const next14 = new Date();
    next14.setDate(today.getDate() + 14);

    const menus = await Menu.findByDateRange(
      past7.toISOString().split('T')[0],
      next14.toISOString().split('T')[0]
    );

    return res.status(200).json({
      success: true,
      message: 'Menus retrieved.',
      data: menus,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new daily menu.
 */
async function createMenu(req, res, next) {
  try {
    const { date, day, breakfast, lunch, snacks, dinner } = req.body;

    const existing = await Menu.findByDate(date);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A menu for date ${date} already exists. Please update the existing menu.`,
        data: null,
      });
    }

    const newMenu = await Menu.create({
      date,
      day,
      breakfast,
      lunch,
      snacks,
      dinner,
    });

    return res.status(201).json({
      success: true,
      message: 'Daily menu created successfully.',
      data: newMenu,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update an existing menu (including drag-and-drop dish reordering).
 */
async function updateMenu(req, res, next) {
  try {
    const { id } = req.params;
    const { breakfast, lunch, snacks, dinner, day } = req.body;

    const existing = await Menu.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Menu record not found.',
        data: null,
      });
    }

    const updated = await Menu.update(id, {
      breakfast,
      lunch,
      snacks,
      dinner,
      day,
    });

    return res.status(200).json({
      success: true,
      message: 'Menu updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a menu.
 */
async function deleteMenu(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await Menu.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Menu record not found.',
        data: null,
      });
    }

    await Menu.delete(id);

    return res.status(200).json({
      success: true,
      message: 'Menu deleted successfully.',
      data: null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Copy 7-day menu from a previous week.
 */
async function copyWeek(req, res, next) {
  try {
    const { from_week_start, to_week_start } = req.body;

    if (!from_week_start || !to_week_start) {
      return res.status(400).json({
        success: false,
        message: 'Both from_week_start and to_week_start dates (YYYY-MM-DD) are required.',
      });
    }

    const copied = await Menu.copyWeek(from_week_start, to_week_start);

    return res.status(200).json({
      success: true,
      message: `Successfully duplicated ${copied.length} daily menus to target week.`,
      data: copied,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Student Directory with filters.
 */
async function getStudents(req, res, next) {
  try {
    const { verified, blocked, search, hostel } = req.query;

    const filters = {};
    if (typeof verified !== 'undefined') {
      filters.verified = verified === 'true';
    }
    if (typeof blocked !== 'undefined') {
      filters.blocked = blocked === 'true';
    }
    if (search) filters.search = search.trim();
    if (hostel) filters.hostel = hostel.trim();

    const students = await Student.findAll(filters);

    return res.status(200).json({
      success: true,
      message: 'Students list retrieved.',
      data: students,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Verify a student registration.
 */
async function verifyStudent(req, res, next) {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const updated = await Student.updateVerification(id, true);

    return res.status(200).json({
      success: true,
      message: `Student ${student.name} (${student.roll_number}) verified successfully.`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Reject a student registration (removes the pending unverified record).
 */
async function rejectStudent(req, res, next) {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    await Student.delete(id);

    return res.status(200).json({
      success: true,
      message: `Registration for ${student.name} rejected and removed.`,
      data: null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Block a student account.
 */
async function blockStudent(req, res, next) {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const updated = await Student.updateBlockedStatus(id, true);

    return res.status(200).json({
      success: true,
      message: `Student ${student.name} blocked successfully.`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Unblock a student account.
 */
async function unblockStudent(req, res, next) {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const updated = await Student.updateBlockedStatus(id, false);

    return res.status(200).json({
      success: true,
      message: `Student ${student.name} unblocked successfully.`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Permanently delete a student.
 */
async function deleteStudent(req, res, next) {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    await Student.delete(id);

    return res.status(200).json({
      success: true,
      message: `Student record permanently deleted.`,
      data: null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * View and filter student ratings.
 */
async function getRatings(req, res, next) {
  try {
    const { meal_type, date_from, date_to, rating } = req.query;

    const ratings = await Rating.findAll({
      meal_type,
      date_from,
      date_to,
      rating,
    });

    return res.status(200).json({
      success: true,
      message: 'Ratings retrieved.',
      data: ratings,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * View complaints (with optional status filter).
 */
async function getComplaints(req, res, next) {
  try {
    const { status } = req.query;

    const complaints = await Complaint.findAll({ status });

    return res.status(200).json({
      success: true,
      message: 'Complaints retrieved.',
      data: complaints,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Respond to and resolve/reject a complaint.
 */
async function respondComplaint(req, res, next) {
  try {
    const { id } = req.params;
    const { status, admin_response } = req.body;

    const existing = await Complaint.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Complaint record not found.' });
    }

    const updated = await Complaint.updateStatus(id, {
      status,
      admin_response,
    });

    return res.status(200).json({
      success: true,
      message: 'Complaint response recorded successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get attendance report (meal-wise and date-wise).
 */
async function getAttendanceReport(req, res, next) {
  try {
    const { date_from, date_to } = req.query;

    const report = await Attendance.getReport({ date_from, date_to });

    return res.status(200).json({
      success: true,
      message: 'Attendance report compiled.',
      data: report,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Export attendance report to CSV.
 */
async function exportAttendanceCSV(req, res, next) {
  try {
    const { date_from, date_to } = req.query;

    const report = await Attendance.getReport({ date_from, date_to });
    const records = report.records || [];

    // Construct CSV Header
    let csv = 'Date,Roll Number,Student Name,Hostel,Room,Breakfast,Lunch,Snacks,Dinner,Created At\n';

    records.forEach((r) => {
      const studentName = r.students ? `"${r.students.name.replace(/"/g, '""')}"` : 'Unknown';
      const rollNumber = r.students ? r.students.roll_number : '';
      const hostel = r.students ? `"${r.students.hostel_name.replace(/"/g, '""')}"` : '';
      const room = r.students ? `"${r.students.room_number.replace(/"/g, '""')}"` : '';

      csv += `${r.date},${rollNumber},${studentName},${hostel},${room},${r.breakfast ? 'Yes' : 'No'},${r.lunch ? 'Yes' : 'No'},${r.snacks ? 'Yes' : 'No'},${r.dinner ? 'Yes' : 'No'},${r.created_at}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="smartmess_attendance_${date_from || 'all'}_to_${date_to || 'all'}.csv"`);
    return res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}

/**
 * Get comprehensive analytics (ratings, dishes ranking, attendance, forecast).
 */
async function getAnalytics(req, res, next) {
  try {
    const mealRatings = await Rating.getMealAverages();
    const { topDishes, bottomDishes } = await Rating.getTopAndBottomDishes();
    const attendanceTrends = await Attendance.getAttendanceTrends(14);
    const forecast = await Attendance.getMovingAverageForecast(7);

    return res.status(200).json({
      success: true,
      message: 'Analytics data retrieved.',
      data: {
        mealRatings,
        topDishes,
        bottomDishes,
        attendanceTrends,
        forecast,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboard,
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  copyWeek,
  getStudents,
  verifyStudent,
  rejectStudent,
  blockStudent,
  unblockStudent,
  deleteStudent,
  getRatings,
  getComplaints,
  respondComplaint,
  getAttendanceReport,
  exportAttendanceCSV,
  getAnalytics,
};
