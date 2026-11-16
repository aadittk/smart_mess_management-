/**
 * @file auth.js
 * @description JWT authentication middleware.
 */
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'smartmess_super_secure_jwt_secret_key_2024_university_project_auth';

/**
 * Middleware to verify JWT from Authorization header.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: No authorization token provided.',
      data: null,
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
        data: null,
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.',
      data: null,
    });
  }
}

module.exports = { verifyToken };
