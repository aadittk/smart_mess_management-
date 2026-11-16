/**
 * @file roleGuard.js
 * @description Role-based access control middleware.
 */

/**
 * Ensures authenticated user has one of the specified roles.
 * @param {...string} allowedRoles
 */
function roleGuard(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        data: null,
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires [${allowedRoles.join(' or ')}] privileges.`,
        data: null,
      });
    }

    next();
  };
}

const adminOnly = roleGuard('admin');
const studentOnly = roleGuard('student');

module.exports = {
  roleGuard,
  adminOnly,
  studentOnly,
};
