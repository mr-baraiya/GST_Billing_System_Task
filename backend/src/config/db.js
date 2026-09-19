require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let poolConfig = {};

if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  };
} else {
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'gst_billing',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error', err);
});

async function initDb() {
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, '../../db/schema.sql'), 'utf8');
    await pool.query(schemaSql);

    // Auto-migrate new columns for users table on existing databases
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile VARCHAR(20);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'Owner';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR(10);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires TIMESTAMP WITH TIME ZONE;
    `);

    console.log('Database schema verified & auto-migrated successfully.');
  } catch (err) {
    console.error('Database auto-migration note:', err.message);
  }
}

module.exports = { pool, initDb };
