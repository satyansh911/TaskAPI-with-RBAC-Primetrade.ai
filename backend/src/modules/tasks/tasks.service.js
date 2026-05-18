const db = require('../../config/db');
const ApiError = require('../../utils/ApiError');

/**
 * Get tasks for the authenticated user (paginated, filtered)
 */
const getUserTasks = async (userId, { page, limit, status, priority, sort, order }) => {
  const offset = (page - 1) * limit;

  // Build dynamic WHERE clause
  const conditions = ['user_id = $1'];
  const values = [userId];
  let idx = 2;

  if (status) { conditions.push(`status = $${idx++}`); values.push(status); }
  if (priority) { conditions.push(`priority = $${idx++}`); values.push(priority); }

  // Whitelist sort columns to prevent injection
  const allowedSort = ['created_at', 'due_date', 'priority', 'title'];
  const sortCol = allowedSort.includes(sort) ? sort : 'created_at';
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

  const whereClause = conditions.join(' AND ');

  const [tasksResult, countResult] = await Promise.all([
    db.query(
      `SELECT * FROM tasks WHERE ${whereClause}
       ORDER BY ${sortCol} ${sortOrder}
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset]
    ),
    db.query(`SELECT COUNT(*) FROM tasks WHERE ${whereClause}`, values),
  ]);

  return {
    tasks: tasksResult.rows,
    meta: {
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
    },
  };
};

/**
 * Get a single task by ID (user must own it)
 */
const getTaskById = async (taskId, userId) => {
  const result = await db.query(
    'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
    [taskId, userId]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Task not found.');
  }

  return result.rows[0];
};

/**
 * Create a new task
 */
const createTask = async (userId, { title, description, status, priority, due_date }) => {
  const result = await db.query(
    `INSERT INTO tasks (user_id, title, description, status, priority, due_date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, title, description || null, status, priority, due_date || null]
  );

  return result.rows[0];
};

/**
 * Update a task (owner only)
 */
const updateTask = async (taskId, userId, updates) => {
  // Verify ownership first
  const existing = await db.query(
    'SELECT id FROM tasks WHERE id = $1 AND user_id = $2',
    [taskId, userId]
  );

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Task not found.');
  }

  // Build dynamic SET clause
  const fields = Object.keys(updates);
  const setClauses = fields.map((field, i) => `${field} = $${i + 1}`);
  const values = fields.map((f) => updates[f]);

  const result = await db.query(
    `UPDATE tasks
     SET ${setClauses.join(', ')}, updated_at = NOW()
     WHERE id = $${fields.length + 1} AND user_id = $${fields.length + 2}
     RETURNING *`,
    [...values, taskId, userId]
  );

  return result.rows[0];
};

/**
 * Delete a task (owner only)
 */
const deleteTask = async (taskId, userId) => {
  const result = await db.query(
    'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
    [taskId, userId]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Task not found.');
  }

  return true;
};

// ──────────────── Admin-only functions ────────────────

/**
 * Admin: Get all tasks (all users), paginated
 */
const getAllTasks = async ({ page, limit, status, priority, sort, order }) => {
  const offset = (page - 1) * limit;

  const conditions = [];
  const values = [];
  let idx = 1;

  if (status) { conditions.push(`t.status = $${idx++}`); values.push(status); }
  if (priority) { conditions.push(`t.priority = $${idx++}`); values.push(priority); }

  const allowedSort = ['created_at', 'due_date', 'priority', 'title'];
  const sortCol = allowedSort.includes(sort) ? sort : 'created_at';
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [tasksResult, countResult] = await Promise.all([
    db.query(
      `SELECT t.*, u.name as user_name, u.email as user_email
       FROM tasks t
       JOIN users u ON t.user_id = u.id
       ${whereClause}
       ORDER BY t.${sortCol} ${sortOrder}
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset]
    ),
    db.query(`SELECT COUNT(*) FROM tasks t ${whereClause}`, values),
  ]);

  return {
    tasks: tasksResult.rows,
    meta: {
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
    },
  };
};

/**
 * Admin: Delete any task
 */
const adminDeleteTask = async (taskId) => {
  const result = await db.query(
    'DELETE FROM tasks WHERE id = $1 RETURNING id',
    [taskId]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Task not found.');
  }

  return true;
};

/**
 * Admin: Get all users
 */
const getAllUsers = async ({ page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;

  const [usersResult, countResult] = await Promise.all([
    db.query(
      `SELECT id, name, email, role, created_at FROM users
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    ),
    db.query('SELECT COUNT(*) FROM users'),
  ]);

  return {
    users: usersResult.rows,
    meta: {
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
    },
  };
};

module.exports = {
  getUserTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getAllTasks,
  adminDeleteTask,
  getAllUsers,
};
