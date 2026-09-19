require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  let clientConfig = {};
  if (process.env.DATABASE_URL) {
    clientConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    };
  } else {
    clientConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'gst_billing',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    };
  }

  const client = new Client(clientConfig);
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database. Applying schema...');
    await client.query(sql);
    console.log('Schema applied successfully.');
  } catch (err) {
    console.error('Failed to apply schema:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
