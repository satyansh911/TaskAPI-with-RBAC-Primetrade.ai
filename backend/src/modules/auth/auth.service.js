const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');
const ApiError = require('../../utils/ApiError');

const SALT_ROUNDS = 12;

/**
 * Register a new user
 */
const register = async ({ name, email, password, adminKey }) => {
  // Check if email already exists
  const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Determine role
  const role =
    adminKey && adminKey === process.env.ADMIN_KEY ? 'admin' : 'user';

  // Insert user
  const result = await db.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at`,
    [name, email, hashedPassword, role]
  );

  const user = result.rows[0];

  // Generate JWT
  const token = generateToken(user);

  return { user, token };
};

/**
 * Login an existing user
 */
const login = async ({ email, password }) => {
  // Find user
  const result = await db.query(
    'SELECT id, name, email, password, role, created_at FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const user = result.rows[0];

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  // Remove password from returned user
  const { password: _pw, ...safeUser } = user;

  // Generate JWT
  const token = generateToken(safeUser);

  return { user: safeUser, token };
};

/**
 * Get current authenticated user
 */
const getMe = async (userId) => {
  const result = await db.query(
    'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'User not found.');
  }

  return result.rows[0];
};

/**
 * Generate a signed JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

module.exports = { register, login, getMe };
