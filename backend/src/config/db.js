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

      -- Allow deleting parties and items while preserving historical invoice records
      ALTER TABLE bills ALTER COLUMN party_id DROP NOT NULL;
      ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_party_id_fkey;
      ALTER TABLE bills ADD CONSTRAINT bills_party_id_fkey FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE SET NULL;

      ALTER TABLE bill_items ALTER COLUMN item_id DROP NOT NULL;
      ALTER TABLE bill_items DROP CONSTRAINT IF EXISTS bill_items_item_id_fkey;
      ALTER TABLE bill_items ADD CONSTRAINT bill_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL;

      CREATE TABLE IF NOT EXISTS custom_roles (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          permissions JSONB NOT NULL DEFAULT '[]',
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS gst_rates (
          id SERIAL PRIMARY KEY,
          rate NUMERIC(5,2) UNIQUE NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      INSERT INTO gst_rates (rate) VALUES (0), (5), (12), (18), (28) ON CONFLICT (rate) DO NOTHING;
    `);

    console.log('Database schema verified & auto-migrated successfully.');
  } catch (err) {
    console.error('Database auto-migration note:', err.message);
  }
}

module.exports = { pool, initDb };
