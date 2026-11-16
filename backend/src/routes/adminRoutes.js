/**
 * @file adminRoutes.js
 * @description Administrator operations routing endpoints.
 */
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleGuard');
const {
  validateMenu,
  validateComplaintResponse,
} = require('../middleware/validator');

// All admin routes require valid admin JWT
router.use(verifyToken, adminOnly);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Menu Management
router.get('/menus', adminController.getMenus);
router.post('/menus', validateMenu, adminController.createMenu);
router.put('/menus/:id', adminController.updateMenu);
router.delete('/menus/:id', adminController.deleteMenu);
router.post('/menus/copy-week', adminController.copyWeek);

// Student Directory & Verification
router.get('/students', adminController.getStudents);
router.put('/students/:id/verify', adminController.verifyStudent);
router.put('/students/:id/reject', adminController.rejectStudent);
router.put('/students/:id/block', adminController.blockStudent);
router.put('/students/:id/unblock', adminController.unblockStudent);
router.delete('/students/:id', adminController.deleteStudent);

// Ratings View
router.get('/ratings', adminController.getRatings);

// Complaints Management
router.get('/complaints', adminController.getComplaints);
router.put('/complaints/:id', validateComplaintResponse, adminController.respondComplaint);

// Attendance Reports & CSV
router.get('/attendance/report', adminController.getAttendanceReport);
router.get('/attendance/export-csv', adminController.exportAttendanceCSV);

// Analytics & Forecast
router.get('/analytics/summary', adminController.getAnalytics);

module.exports = router;
