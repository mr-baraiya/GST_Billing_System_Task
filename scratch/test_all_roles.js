const path = require('path');
const { pool } = require(path.join(__dirname, '../backend/src/config/db'));
const roleController = require(path.join(__dirname, '../backend/src/controllers/roleController'));

async function testAllRoles() {
  try {
    const fakeReq = {};
    const fakeRes = {
      json: (data) => {
        console.log('Roles returned by API:', data);
        process.exit(0);
      },
      status: (code) => fakeRes
    };

    await roleController.getAllRoles(fakeReq, fakeRes);
  } catch (err) {
    console.error('Error fetching all roles:', err);
    process.exit(1);
  }
}

testAllRoles();
