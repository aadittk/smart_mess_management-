/**
 * @file authRoutes.js
 * @description Authentication routing endpoints.
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { authRateLimiter } = require('../middleware/rateLimiter');
const { validateRegistration, validateLogin } = require('../middleware/validator');

router.post('/register', authRateLimiter, validateRegistration, authController.register);
router.post('/login', authRateLimiter, validateLogin, authController.login);
router.post('/admin/login', authRateLimiter, validateLogin, authController.adminLogin);
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
