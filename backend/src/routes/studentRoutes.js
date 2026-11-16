/**
 * @file studentRoutes.js
 * @description Student operations routing endpoints.
 */
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken } = require('../middleware/auth');
const { studentOnly } = require('../middleware/roleGuard');
const {
  validateRating,
  validateRatingUpdate,
  validateAttendance,
  validateComplaint,
} = require('../middleware/validator');

// All student routes require valid student JWT
router.use(verifyToken, studentOnly);

// Menu endpoints
router.get('/menu/today', studentController.getTodayMenu);
router.get('/menu/weekly', studentController.getWeeklyMenu);

// Rating endpoints
router.get('/ratings', studentController.getRatings);
router.post('/ratings', validateRating, studentController.createRating);
router.put('/ratings/:id', validateRatingUpdate, studentController.updateRating);
router.delete('/ratings/:id', studentController.deleteRating);

// Attendance endpoints
router.get('/attendance', studentController.getAttendance);
router.post('/attendance', validateAttendance, studentController.markAttendance);

// Grievance / Complaint endpoints
router.get('/complaints', studentController.getComplaints);
router.post('/complaints', validateComplaint, studentController.createComplaint);

// Profile endpoints
router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);
router.put('/password', studentController.changePassword);

module.exports = router;
