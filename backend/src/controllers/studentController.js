/**
 * @file studentController.js
 * @description Controller for student-facing operations.
 */
const bcrypt = require('bcrypt');
const Student = require('../models/Student');
const Menu = require('../models/Menu');
const Rating = require('../models/Rating');
const Attendance = require('../models/Attendance');
const Complaint = require('../models/Complaint');
const timeUtils = require('../utils/timeWindows');

const BCRYPT_SALT_ROUNDS = 10;

/**
 * Get Today's Menu with active meal window highlight & student rating status.
 */
async function getTodayMenu(req, res, next) {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const menu = await Menu.findByDate(todayStr);

    const activeMeal = timeUtils.getCurrentActiveMeal();
    const mealWindows = timeUtils.getMealWindowsConfig();

    let studentRatings = [];
    if (menu) {
      const allStudentRatings = await Rating.findByStudent(req.user.id);
      studentRatings = allStudentRatings.filter((r) => r.menu_id === menu.id);
    }

    return res.status(200).json({
      success: true,
      message: menu ? "Today's menu retrieved." : 'No menu published for today.',
      data: {
        date: todayStr,
        menu,
        activeMeal,
        mealWindows,
        studentRatings,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get 7-Day Weekly Menu.
 */
async function getWeeklyMenu(req, res, next) {
  try {
    const startDateParam = req.query.start_date;
    let startDate;

    if (startDateParam) {
      startDate = new Date(startDateParam);
    } else {
      // Default to current week's Monday
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      startDate = new Date(now.setDate(diff));
    }

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const menus = await Menu.findByDateRange(startStr, endStr);

    return res.status(200).json({
      success: true,
      message: 'Weekly menu retrieved.',
      data: {
        weekStart: startStr,
        weekEnd: endStr,
        menus,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all ratings submitted by the authenticated student.
 */
async function getRatings(req, res, next) {
  try {
    const ratings = await Rating.findByStudent(req.user.id);
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
 * Submit a rating for a specific meal.
 */
async function createRating(req, res, next) {
  try {
    const { menu_id, meal_type, rating, comment } = req.body;

    // Check for duplicate rating for same menu & meal
    const existing = await Rating.findByStudentAndMenuMeal(req.user.id, menu_id, meal_type);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `You have already submitted a rating for this ${meal_type}. You can edit your existing rating instead.`,
        data: null,
      });
    }

    const newRating = await Rating.create({
      student_id: req.user.id,
      menu_id,
      meal_type,
      rating: parseInt(rating, 10),
      comment,
    });

    return res.status(201).json({
      success: true,
      message: 'Rating submitted successfully.',
      data: newRating,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update a previously submitted rating.
 */
async function updateRating(req, res, next) {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const existing = await Rating.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Rating record not found.',
        data: null,
      });
    }

    if (existing.student_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot modify ratings submitted by other students.',
        data: null,
      });
    }

    const updated = await Rating.update(id, {
      rating: parseInt(rating, 10),
      comment,
    });

    return res.status(200).json({
      success: true,
      message: 'Rating updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a previously submitted rating.
 */
async function deleteRating(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await Rating.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Rating record not found.',
        data: null,
      });
    }

    if (existing.student_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot delete ratings submitted by other students.',
        data: null,
      });
    }

    await Rating.delete(id);

    return res.status(200).json({
      success: true,
      message: 'Rating deleted successfully.',
      data: null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get student's attendance records (today's status and monthly history).
 */
async function getAttendance(req, res, next) {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecord = await Attendance.findByStudentAndDate(req.user.id, todayStr);

    const month = req.query.month ? parseInt(req.query.month, 10) : new Date().getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();

    const history = await Attendance.findByStudent(req.user.id, month, year);

    const mealWindows = timeUtils.getMealWindowsConfig();
    const activeMeal = timeUtils.getCurrentActiveMeal();

    return res.status(200).json({
      success: true,
      message: 'Attendance data retrieved.',
      data: {
        today: todayRecord || {
          date: todayStr,
          breakfast: false,
          lunch: false,
          snacks: false,
          dinner: false,
        },
        activeMeal,
        mealWindows,
        history,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Mark attendance for a meal.
 */
async function markAttendance(req, res, next) {
  try {
    const { meal_type } = req.body;
    const normalizedMeal = meal_type.toLowerCase();

    // Validate meal time window
    const windowCheck = timeUtils.isWithinMealWindow(normalizedMeal);
    if (!windowCheck.valid) {
      return res.status(400).json({
        success: false,
        message: windowCheck.message,
        data: null,
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const result = await Attendance.markMeal(req.user.id, todayStr, normalizedMeal);

    return res.status(200).json({
      success: true,
      message: `Attendance marked successfully for ${normalizedMeal}.`,
      data: result,
    });
  } catch (err) {
    if (err.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: err.message,
        data: null,
      });
    }
    next(err);
  }
}

/**
 * Get complaints submitted by the student.
 */
async function getComplaints(req, res, next) {
  try {
    const complaints = await Complaint.findByStudent(req.user.id);
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
 * Submit a new grievance / complaint.
 */
async function createComplaint(req, res, next) {
  try {
    const { title, description } = req.body;

    const complaint = await Complaint.create({
      student_id: req.user.id,
      title,
      description,
    });

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      data: complaint,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get student profile.
 */
async function getProfile(req, res, next) {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }
    return res.status(200).json({
      success: true,
      message: 'Profile retrieved.',
      data: student,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update student contact details.
 */
async function updateProfile(req, res, next) {
  try {
    const { room_number, phone_number } = req.body;

    const updated = await Student.updateProfile(req.user.id, {
      room_number,
      phone_number,
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Change student password.
 */
async function changePassword(req, res, next) {
  try {
    const { current_password, new_password } = req.body;

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const student = await Student.findByIdWithPassword(req.user.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const isMatch = await bcrypt.compare(current_password, student.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    const hashed = await bcrypt.hash(new_password, BCRYPT_SALT_ROUNDS);
    await Student.updatePassword(req.user.id, hashed);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTodayMenu,
  getWeeklyMenu,
  getRatings,
  createRating,
  updateRating,
  deleteRating,
  getAttendance,
  markAttendance,
  getComplaints,
  createComplaint,
  getProfile,
  updateProfile,
  changePassword,
};
