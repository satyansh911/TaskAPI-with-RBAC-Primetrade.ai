require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const usersResult = await pool.query('SELECT id, name, email, role FROM users');
    console.log('--- USERS ---');
    console.table(usersResult.rows);

    const tasksResult = await pool.query('SELECT id, user_id, title, status FROM tasks');
    console.log('--- TASKS ---');
    console.table(tasksResult.rows);
  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await pool.end();
  }
}

main();
