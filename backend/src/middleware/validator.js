/**
 * @file validator.js
 * @description Input validation middleware rules using express-validator.
 */
const { body, param, validationResult } = require('express-validator');

/**
 * Middleware to check validation results and return formatted error response.
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed: ' + errors.array().map((e) => e.msg).join(', '),
      errors: errors.array(),
      data: null,
    });
  }
  next();
}

const validateRegistration = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('A valid university email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('roll_number').trim().notEmpty().withMessage('Roll number is required'),
  body('hostel_name').trim().notEmpty().withMessage('Hostel name is required'),
  body('room_number').trim().notEmpty().withMessage('Room number is required'),
  body('phone_number')
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be 10-15 digits'),
  handleValidationErrors,
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const validateRating = [
  body('menu_id').isUUID().withMessage('Valid menu UUID is required'),
  body('meal_type')
    .isIn(['breakfast', 'lunch', 'snacks', 'dinner'])
    .withMessage('Meal type must be breakfast, lunch, snacks, or dinner'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment').optional().isString().trim(),
  handleValidationErrors,
];

const validateRatingUpdate = [
  param('id').isUUID().withMessage('Valid rating UUID required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment').optional().isString().trim(),
  handleValidationErrors,
];

const validateAttendance = [
  body('meal_type')
    .isIn(['breakfast', 'lunch', 'snacks', 'dinner'])
    .withMessage('Meal type must be breakfast, lunch, snacks, or dinner'),
  handleValidationErrors,
];

const validateComplaint = [
  body('title').trim().notEmpty().isLength({ max: 200 }).withMessage('Title is required (max 200 chars)'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  handleValidationErrors,
];

const validateComplaintResponse = [
  param('id').isUUID().withMessage('Valid complaint UUID required'),
  body('status')
    .isIn(['pending', 'in_progress', 'resolved', 'rejected'])
    .withMessage('Status must be pending, in_progress, resolved, or rejected'),
  body('admin_response').trim().notEmpty().withMessage('Admin response is required'),
  handleValidationErrors,
];

const validateMenu = [
  body('date').isISO8601().withMessage('Valid date in YYYY-MM-DD format required'),
  body('day').trim().notEmpty().withMessage('Day name is required (e.g., Monday)'),
  body('breakfast').isArray().withMessage('Breakfast dishes must be an array'),
  body('lunch').isArray().withMessage('Lunch dishes must be an array'),
  body('snacks').isArray().withMessage('Snacks dishes must be an array'),
  body('dinner').isArray().withMessage('Dinner dishes must be an array'),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateRating,
  validateRatingUpdate,
  validateAttendance,
  validateComplaint,
  validateComplaintResponse,
  validateMenu,
};
