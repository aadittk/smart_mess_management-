/**
 * @file authController.js
 * @description Authentication controller for Students and Admins.
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'smartmess_super_secure_jwt_secret_key_2024_university_project_auth';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const BCRYPT_SALT_ROUNDS = 10;

/**
 * Register a new student account (initially unverified).
 */
async function register(req, res, next) {
  try {
    const { name, email, password, roll_number, hostel_name, room_number, phone_number } = req.body;

    const existingEmail = await Student.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'An account with this university email already exists.',
        data: null,
      });
    }

    const existingRoll = await Student.findByRollNumber(roll_number);
    if (existingRoll) {
      return res.status(409).json({
        success: false,
        message: 'A student with this roll number is already registered.',
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const student = await Student.create({
      name,
      email,
      password: hashedPassword,
      roll_number,
      hostel_name,
      room_number,
      phone_number,
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Your account is pending administrator verification.',
      data: {
        id: student.id,
        name: student.name,
        email: student.email,
        roll_number: student.roll_number,
        is_verified: student.is_verified,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Authenticate student user and issue JWT.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const student = await Student.findByEmail(email);
    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        data: null,
      });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        data: null,
      });
    }

    if (!student.is_verified) {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending administrator verification. Please contact the mess warden.',
        data: { is_verified: false },
      });
    }

    if (student.is_blocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by the mess administrator.',
        data: { is_blocked: true },
      });
    }

    const payload = {
      id: student.id,
      email: student.email,
      name: student.name,
      role: 'student',
      roll_number: student.roll_number,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: student.id,
          name: student.name,
          email: student.email,
          roll_number: student.roll_number,
          hostel_name: student.hostel_name,
          room_number: student.room_number,
          role: 'student',
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Authenticate administrator and issue JWT.
 */
async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findByEmail(email);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials.',
        data: null,
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials.',
        data: null,
      });
    }

    const payload = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: 'admin',
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(200).json({
      success: true,
      message: 'Admin login successful.',
      data: {
        token,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: 'admin',
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieve current authenticated user profile.
 */
async function getMe(req, res, next) {
  try {
    if (req.user.role === 'admin') {
      const admin = await Admin.findById(req.user.id);
      if (!admin) {
        return res.status(404).json({ success: false, message: 'Admin record not found.' });
      }
      return res.status(200).json({
        success: true,
        message: 'Profile retrieved.',
        data: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: 'admin',
        },
      });
    }

    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }
    return res.status(200).json({
      success: true,
      message: 'Profile retrieved.',
      data: {
        ...student,
        role: 'student',
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  adminLogin,
  getMe,
};
