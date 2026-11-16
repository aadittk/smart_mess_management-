/**
 * @file errorHandler.js
 * @description Centralized error handling middleware.
 */

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[Error Logger]', {
    message: err.message,
    path: req.originalUrl,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  let message = err.message || 'Internal Server Error';

  if (err.message && (err.message.includes('fetch failed') || (err.name === 'TypeError' && err.message === 'fetch failed'))) {
    message = 'Database connection error: Could not reach Supabase. Please verify SUPABASE_URL and SUPABASE_KEY in backend/.env.';
  }

  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = { errorHandler };
