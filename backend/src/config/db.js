const { Pool, types } = require('pg');

// Force DATE columns to return as plain 'YYYY-MM-DD' strings.
// Without this, pg's default parser (postgres-date) converts '2026-05-21' into
// a JS Date at LOCAL midnight (e.g. 2026-05-21T00:00:00+05:30 = 2026-05-20T18:30:00Z).
// Any UTC-based serialization (toISOString, JSON.stringify) then shows the previous day.
types.setTypeParser(1082, (val) => val); // 1082 = DATE OID

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: true }
    : { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected DB pool error', err);
});

/**
 * Execute a parameterized query
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 */
const query = (text, params) => pool.query(text, params);

module.exports = { query, pool };
