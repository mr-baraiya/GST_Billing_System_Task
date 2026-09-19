const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { sendPasswordResetEmail, sendLoginOtpEmail } = require('../utils/emailService');
const { getPermissionsForRole } = require('../utils/permissions');

const JWT_SECRET = process.env.JWT_SECRET || 'gst_billing_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

function generateToken(user) {
  const permissionsList = getPermissionsForRole(user.role, user.permissions);

  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role || 'Owner',
      permissions: permissionsList,
      status: user.status || 'active',
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, mobile, profile_picture } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // Determine role: First user is Owner, subsequent public registrations are Billing Staff
    const userCountRes = await pool.query('SELECT COUNT(*) FROM users');
    const isFirstUser = parseInt(userCountRes.rows[0].count, 10) === 0;
    const userRole = isFirstUser ? 'Owner' : 'Billing Staff';
    const computedPermissions = JSON.stringify(getPermissionsForRole(userRole));

    // Hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, mobile, profile_picture, role, permissions, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
       RETURNING id, name, email, mobile, profile_picture, role, permissions, status, created_at`,
      [name.trim(), cleanEmail, hashedPassword, mobile || null, profile_picture || null, userRole, computedPermissions]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        profile_picture: user.profile_picture,
        role: user.role,
        permissions: getPermissionsForRole(user.role, user.permissions),
        status: user.status,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

// POST /api/auth/login (Step 1: Check password & send 2FA OTP)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user by email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check account active status
    if (user.status && user.status !== 'active') {
      return res.status(403).json({ error: 'Account has been deactivated. Please contact your system Owner.' });
    }

    // Verify password with bcryptjs
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate 6-digit OTP code & 10-minute expiration timestamp
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      'UPDATE users SET otp_code = $1, otp_expires = $2 WHERE id = $3',
      [otpCode, otpExpires, user.id]
    );

    // Send OTP email (Race condition so response returns immediately on Vercel)
    try {
      await Promise.race([
        sendLoginOtpEmail(user.email, otpCode, user.name),
        new Promise((resolve) => setTimeout(resolve, 2500))
      ]);
    } catch (emailErr) {
      console.error('OTP email note:', emailErr.message);
    }

    res.json({
      requireOtp: true,
      email: user.email,
      message: `A 6-digit verification code has been sent to ${user.email}.`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to initiate login OTP verification' });
  }
};

// POST /api/auth/verify-otp (Step 2: Verify OTP & Issue Token)
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and 6-digit OTP are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User account not found' });
    }

    const user = result.rows[0];

    if (!user.otp_code || !user.otp_expires) {
      return res.status(400).json({ error: 'No OTP session found. Please log in again.' });
    }

    if (new Date(user.otp_expires) <= new Date()) {
      return res.status(400).json({ error: 'OTP code has expired. Please click Resend OTP to get a new code.' });
    }

    if (user.otp_code !== cleanOtp) {
      return res.status(400).json({ error: 'Invalid OTP code. Please check your email and try again.' });
    }

    // Clear OTP fields in DB upon successful verification
    await pool.query('UPDATE users SET otp_code = NULL, otp_expires = NULL WHERE id = $1', [user.id]);

    const permissionsList = getPermissionsForRole(user.role, user.permissions);
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        profile_picture: user.profile_picture,
        role: user.role || 'Owner',
        permissions: permissionsList,
        status: user.status || 'active',
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to verify OTP code' });
  }
};

// POST /api/auth/resend-otp
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required to resend OTP' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User account not found' });
    }

    const user = result.rows[0];

    // Generate new 6-digit OTP code & 10-minute expiration
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      'UPDATE users SET otp_code = $1, otp_expires = $2 WHERE id = $3',
      [otpCode, otpExpires, user.id]
    );

    try {
      await Promise.race([
        sendLoginOtpEmail(user.email, otpCode, user.name),
        new Promise((resolve) => setTimeout(resolve, 2500))
      ]);
    } catch (emailErr) {
      console.error('Resend OTP email note:', emailErr.message);
    }

    res.json({ message: `A new 6-digit verification code has been sent to ${user.email}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const result = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [cleanEmail]);
    if (result.rows.length === 0) {
      return res.json({ message: 'If an account exists with that email, a password reset link has been sent.' });
    }

    const user = result.rows[0];

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await pool.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3',
      [resetTokenHash, expires, user.id]
    );

    const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail(user.email, resetUrl, user.name);

    res.json({ message: 'If an account exists with that email, a password reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process forgot password request' });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const result = await pool.query(
      `SELECT * FROM users
       WHERE reset_password_token = $1 AND reset_password_expires > NOW()`,
      [resetTokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired' });
    }

    const user = result.rows[0];

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query(
      `UPDATE users
       SET password = $1, reset_password_token = NULL, reset_password_expires = NULL
       WHERE id = $2`,
      [hashedPassword, user.id]
    );

    res.json({ message: 'Password reset successful. You can now log in with your new password.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const userRes = await pool.query(
      'SELECT id, name, email, mobile, profile_picture, role, permissions, status, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = userRes.rows[0];
    user.permissions = getPermissionsForRole(user.role, user.permissions);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// PUT /api/auth/profile (Protected)
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, mobile, profile_picture } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email is taken by another account
    const existing = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [cleanEmail, req.user.id]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'This email is already taken by another account' });
    }

    const result = await pool.query(
      `UPDATE users
       SET name = $1, email = $2, mobile = $3, profile_picture = $4
       WHERE id = $5
       RETURNING id, name, email, mobile, profile_picture, role, permissions, status`,
      [name.trim(), cleanEmail, mobile || null, profile_picture || null, req.user.id]
    );

    const updatedUser = result.rows[0];
    updatedUser.permissions = getPermissionsForRole(updatedUser.role, updatedUser.permissions);
    const newToken = generateToken(updatedUser);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
      token: newToken,
    });
  } catch (err) {
    console.error('Update profile failure:', err);
    res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
};

// PUT /api/auth/change-password (Protected)
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old password and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Fetch user from DB to get current hashed password
    const userRes = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = userRes.rows[0];

    // Verify old password using bcryptjs
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect old password' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, req.user.id]);

    res.json({ message: 'Password changed successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to change password' });
  }
};
