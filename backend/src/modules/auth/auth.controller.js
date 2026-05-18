const authService = require('./auth.service');
const ApiResponse = require('../../utils/ApiResponse');

/**
 * POST /api/v1/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);
    return new ApiResponse(201, 'Account created successfully.', { user, token }).send(res);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);
    return new ApiResponse(200, 'Login successful.', { user, token }).send(res);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return new ApiResponse(200, 'Profile fetched successfully.', { user }).send(res);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
