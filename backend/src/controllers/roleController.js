const { pool } = require('../config/db');

// Default initial roles to seed into DB if not present
const INITIAL_ROLES = [
  {
    name: 'Manager',
    permissions: ['dashboard', 'parties', 'items', 'create_bill', 'bills_history', 'delete_bill', 'reports', 'manage_staff'],
  },
  {
    name: 'Billing Staff',
    permissions: ['dashboard', 'parties', 'items', 'create_bill', 'bills_history'],
  },
  {
    name: 'Accountant',
    permissions: ['dashboard', 'parties', 'items', 'bills_history', 'reports'],
  },
  {
    name: 'Sales Staff',
    permissions: ['dashboard', 'parties', 'items', 'create_bill', 'bills_history'],
  },
];

async function seedDefaultRolesIfEmpty() {
  try {
    for (const role of INITIAL_ROLES) {
      await pool.query(
        'INSERT INTO custom_roles (name, permissions) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        [role.name, JSON.stringify(role.permissions)]
      );
    }
  } catch (err) {
    console.error('Role seeding note:', err.message);
  }
}

// GET /api/roles (List all business roles)
exports.getAllRoles = async (req, res) => {
  try {
    await seedDefaultRolesIfEmpty();
    const result = await pool.query('SELECT id, name, permissions, created_at FROM custom_roles ORDER BY id ASC');
    const roles = result.rows.map(r => ({
      ...r,
      permissions: typeof r.permissions === 'string' ? JSON.parse(r.permissions) : r.permissions
    }));

    res.json({
      custom: roles,
      all: roles
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch business roles' });
  }
};

// POST /api/roles (Create new role)
exports.createRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Role name is required' });
    }

    const roleName = name.trim();

    if (roleName.toLowerCase() === 'owner') {
      return res.status(400).json({ error: "'Owner' is a reserved system administrator role name" });
    }

    // Check duplicate
    const existing = await pool.query('SELECT id FROM custom_roles WHERE LOWER(name) = LOWER($1)', [roleName]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: `A role named '${roleName}' already exists` });
    }

    const permArray = Array.isArray(permissions) ? permissions : [];
    const permJson = JSON.stringify(permArray);

    const result = await pool.query(
      'INSERT INTO custom_roles (name, permissions) VALUES ($1, $2) RETURNING id, name, permissions, created_at',
      [roleName, permJson]
    );

    const newRole = result.rows[0];
    newRole.permissions = typeof newRole.permissions === 'string' ? JSON.parse(newRole.permissions) : newRole.permissions;

    res.status(201).json({
      message: 'Role created successfully',
      role: newRole,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create role' });
  }
};

// PUT /api/roles/:id (Update any role)
exports.updateRole = async (req, res) => {
  try {
    const roleId = parseInt(req.params.id, 10);
    const { name, permissions } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Role name is required' });
    }

    const newRoleName = name.trim();

    // Check target role exists
    const checkRes = await pool.query('SELECT * FROM custom_roles WHERE id = $1', [roleId]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const oldRole = checkRes.rows[0];

    if (newRoleName.toLowerCase() === 'owner') {
      return res.status(400).json({ error: "'Owner' is a reserved system administrator role name" });
    }

    // Check duplicate in other roles
    const existing = await pool.query('SELECT id FROM custom_roles WHERE LOWER(name) = LOWER($1) AND id != $2', [newRoleName, roleId]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: `Another role named '${newRoleName}' already exists` });
    }

    const permArray = Array.isArray(permissions) ? permissions : [];
    const permJson = JSON.stringify(permArray);

    const result = await pool.query(
      'UPDATE custom_roles SET name = $1, permissions = $2 WHERE id = $3 RETURNING id, name, permissions, created_at',
      [newRoleName, permJson, roleId]
    );

    // If role name changed, update users assigned to old role name
    if (oldRole.name !== newRoleName) {
      await pool.query('UPDATE users SET role = $1 WHERE role = $2', [newRoleName, oldRole.name]);
    }

    // Update permissions for users assigned to this role
    await pool.query('UPDATE users SET permissions = $1 WHERE role = $2', [permJson, newRoleName]);

    const updatedRole = result.rows[0];
    updatedRole.permissions = typeof updatedRole.permissions === 'string' ? JSON.parse(updatedRole.permissions) : updatedRole.permissions;

    res.json({
      message: 'Role updated successfully',
      role: updatedRole,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update role' });
  }
};

// DELETE /api/roles/:id (Delete a role)
exports.deleteRole = async (req, res) => {
  try {
    const roleId = parseInt(req.params.id, 10);

    const checkRes = await pool.query('SELECT name FROM custom_roles WHERE id = $1', [roleId]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const roleName = checkRes.rows[0].name;

    // Safety check: Warning if staff members use this role
    const usersWithRole = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', [roleName]);
    if (parseInt(usersWithRole.rows[0].count, 10) > 0) {
      return res.status(400).json({
        error: `Cannot delete role '${roleName}' because ${usersWithRole.rows[0].count} staff member(s) are assigned to it.`
      });
    }

    await pool.query('DELETE FROM custom_roles WHERE id = $1', [roleId]);

    res.json({ message: `Role '${roleName}' deleted successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete role' });
  }
};
