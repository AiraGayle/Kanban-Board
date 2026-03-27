// DB Pool — single shared pg Pool for the whole app
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL client error:', err.message);
});

module.exports = pool;
