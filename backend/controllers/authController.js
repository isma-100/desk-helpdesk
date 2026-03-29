const User = require('../models/User');
const { AuditLog } = require('../models/index');
const { body, validationResult } = require('express-validator');

// ─── Validation rules ─────────────────────────────────────────────────────────
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['employee', 'technician', 'admin']).withMessage('Invalid role'),
  body('department').optional().trim()
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// ─── Helper ───────────────────────────────────────────────────────────────────
const sendToken = (user, statusCode, res) => {
  const token = user.generateToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id:        user._id,
      name:       user.name,
      email:      user.email,
      role:       user.role,
      department: user.department,
      phone:      user.phone,
      avatar:     user.avatar,
      isActive:   user.isActive,
      createdAt:  user.createdAt
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public (Admin can create technician/admin accounts via /api/users)
const register = [
  ...registerValidation,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { name, email, password, department, phone } = req.body;
    // Public registration is always employee role
    const user = await User.create({ name, email, password, role: 'employee', department, phone });
    sendToken(user, 201, res);
  }
];

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
const login = [
  ...loginValidation,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account has been deactivated. Contact admin.' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendToken(user, 200, res);
  }
];

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: user });
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  const { name, department, phone } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, department, phone },
    { new: true, runValidators: true }
  );
  res.json({ success: true, data: user });
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Both current and new password required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  user.passwordChangedAt = new Date();
  await user.save();
  sendToken(user, 200, res);
};


// @desc    Request password reset (generates token, in production sends email)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  const user = await User.findOne({ email: email.toLowerCase() });
  // Always return success to prevent user enumeration
  if (!user) {
    return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  }

  // Generate a simple 6-digit reset code (production: use crypto.randomBytes + send email)
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const crypto = require('crypto');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetCode).digest('hex');
  user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  await user.save({ validateBeforeSave: false });

  // In production: send email with resetCode
  // For demo: return the code directly (NEVER do this in production)
  const isDev = process.env.NODE_ENV === 'development';
  res.json({
    success: true,
    message: 'Reset code generated. Check your email.',
    ...(isDev && { resetCode, note: 'Code visible in dev mode only' }),
  });
};

// @desc    Reset password using code
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { email, resetCode, newPassword } = req.body;
  if (!email || !resetCode || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, reset code, and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  const crypto = require('crypto');
  const hashedCode = crypto.createHash('sha256').update(resetCode.trim()).digest('hex');

  const user = await User.findOne({
    email: email.toLowerCase(),
    resetPasswordToken: hashedCode,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.passwordChangedAt = new Date();
  await user.save();

  sendToken(user, 200, res);
};

module.exports = { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword };
