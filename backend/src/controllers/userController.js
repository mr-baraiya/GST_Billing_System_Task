const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { getPermissionsForRole } = require('../utils/permissions');

// GET /api/users (List all staff)
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, mobile, profile_picture, role, permissions, status, created_at
       FROM users
       ORDER BY id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch staff list' });
  }
};

// POST /api/users (Create new staff account)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, mobile, profile_picture, role, permissions } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate email
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const userRole = role || 'Billing Staff';
    const computedPermissions = JSON.stringify(getPermissionsForRole(userRole, permissions));

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, mobile, profile_picture, role, permissions, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
       RETURNING id, name, email, mobile, profile_picture, role, permissions, status, created_at`,
      [name.trim(), cleanEmail, hashedPassword, mobile || null, profile_picture || null, userRole, computedPermissions]
    );

    res.status(201).json({
      message: 'Staff account created successfully',
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create staff account' });
  }
};

// PUT /api/users/:id (Update staff member)
exports.updateUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { name, email, mobile, profile_picture, role, permissions, status, password } = req.body;

    // Check target user
    const targetRes = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (targetRes.rows.length === 0) {
      return res.status(404).json({ error: 'User account not found' });
    }
    const targetUser = targetRes.rows[0];

    // Safety constraint: Prevent changing role or status of Owner
    let newRole = role || targetUser.role;
    let newStatus = status || targetUser.status;

    if (targetUser.role === 'Owner') {
      if (role && role !== 'Owner') {
        return res.status(400).json({ error: 'Cannot revoke Owner role from primary administrator' });
      }
      if (status && status !== 'active') {
        return res.status(400).json({ error: 'Cannot deactivate the Owner account' });
      }
    }

    let cleanEmail = targetUser.email;
    if (email) {
      cleanEmail = email.trim().toLowerCase();
      const existing = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [cleanEmail, userId]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Email is already used by another account' });
      }
    }

    const computedPermissions = JSON.stringify(getPermissionsForRole(newRole, permissions));

    let updateQuery = `
      UPDATE users
      SET name = $1, email = $2, mobile = $3, profile_picture = $4, role = $5, permissions = $6, status = $7
    `;
    let queryParams = [
      name ? name.trim() : targetUser.name,
      cleanEmail,
      mobile !== undefined ? mobile : targetUser.mobile,
      profile_picture !== undefined ? profile_picture : targetUser.profile_picture,
      newRole,
      computedPermissions,
      newStatus,
    ];

    // Optional password update
    if (password && password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateQuery += `, password = $8 WHERE id = $9 RETURNING id, name, email, mobile, profile_picture, role, permissions, status, created_at`;
      queryParams.push(hashedPassword, userId);
    } else {
      updateQuery += ` WHERE id = $8 RETURNING id, name, email, mobile, profile_picture, role, permissions, status, created_at`;
      queryParams.push(userId);
    }

    const result = await pool.query(updateQuery, queryParams);

    res.json({
      message: 'Staff account updated successfully',
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update staff account' });
  }
};

// PUT /api/users/:id/toggle-status (Toggle Active / Inactive)
exports.toggleUserStatus = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    const targetRes = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (targetRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const targetUser = targetRes.rows[0];

    if (targetUser.role === 'Owner') {
      return res.status(400).json({ error: 'Cannot deactivate the Owner account' });
    }

    const newStatus = targetUser.status === 'active' ? 'inactive' : 'active';
    const result = await pool.query(
      'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name, email, role, status',
      [newStatus, userId]
    );

    res.json({
      message: `Staff member account marked as ${newStatus}`,
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update staff status' });
  }
};
