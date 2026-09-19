const path = require('path');
const { pool } = require(path.join(__dirname, '../backend/src/config/db'));

async function testRoleEdit() {
  try {
    // 1. Insert test custom role
    const ins = await pool.query("INSERT INTO custom_roles (name, permissions) VALUES ('Test Role', '[\"dashboard\"]') RETURNING *");
    const roleId = ins.rows[0].id;
    console.log('Inserted role:', ins.rows[0]);

    // 2. Edit test custom role
    const upd = await pool.query("UPDATE custom_roles SET name = 'Updated Test Role', permissions = '[\"dashboard\", \"parties\"]' WHERE id = $1 RETURNING *", [roleId]);
    console.log('Updated role:', upd.rows[0]);

    // 3. Delete test custom role
    await pool.query("DELETE FROM custom_roles WHERE id = $1", [roleId]);
    console.log('Deleted test role successfully.');

    process.exit(0);
  } catch (err) {
    console.error('Error testing role edit:', err);
    process.exit(1);
  }
}

testRoleEdit();
