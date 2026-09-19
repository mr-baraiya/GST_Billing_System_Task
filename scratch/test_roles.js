const path = require('path');
const { pool } = require(path.join(__dirname, '../backend/src/config/db'));

async function testRoles() {
  try {
    const res = await pool.query('SELECT * FROM custom_roles');
    console.log('Custom roles in DB:', res.rows);
    process.exit(0);
  } catch (err) {
    console.error('Error querying custom roles:', err);
    process.exit(1);
  }
}

testRoles();
