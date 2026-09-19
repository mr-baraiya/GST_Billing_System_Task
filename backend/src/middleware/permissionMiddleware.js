const { userHasPermission } = require('../utils/permissions');
const { pool } = require('../config/db');

/**
 * Middleware factory to enforce required permission on API endpoints
 */
function requirePermission(permissionKey) {
  return async (req, res, next) => {
    if (req.method === 'OPTIONS') {
      return next();
    }

    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Fetch fresh user details to avoid stale token permissions
      const userRes = await pool.query(
        'SELECT id, name, email, role, permissions, status FROM users WHERE id = $1',
        [req.user.id]
      );

      if (userRes.rows.length === 0) {
        return res.status(401).json({ error: 'User account not found' });
      }

      const currentUser = userRes.rows[0];

      if (currentUser.status !== 'active') {
        return res.status(403).json({ error: 'Account is deactivated. Access denied.' });
      }

      // Check permission
      if (!userHasPermission(currentUser, permissionKey)) {
        return res.status(403).json({
          error: `Permission denied: Missing required permission '${permissionKey}'`,
        });
      }

      // Attach fresh user info to request
      req.userDetails = currentUser;
      next();
    } catch (err) {
      console.error('Permission check error:', err);
      res.status(500).json({ error: 'Failed to verify user permissions' });
    }
  };
}

module.exports = requirePermission;
