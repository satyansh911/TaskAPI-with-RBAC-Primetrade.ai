const tasksService = require('./tasks.service');
const ApiResponse = require('../../utils/ApiResponse');

// ──────────── User CRUD ────────────

const getUserTasks = async (req, res, next) => {
  try {
    const { tasks, meta } = await tasksService.getUserTasks(req.user.id, req.query);
    return new ApiResponse(200, 'Tasks fetched successfully.', { tasks }, meta).send(res);
  } catch (err) {
    next(err);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await tasksService.getTaskById(req.params.id, req.user.id);
    return new ApiResponse(200, 'Task fetched successfully.', { task }).send(res);
  } catch (err) {
    next(err);
  }
};

const createTask = async (req, res, next) => {
  try {
    const task = await tasksService.createTask(req.user.id, req.body);
    return new ApiResponse(201, 'Task created successfully.', { task }).send(res);
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await tasksService.updateTask(req.params.id, req.user.id, req.body);
    return new ApiResponse(200, 'Task updated successfully.', { task }).send(res);
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    await tasksService.deleteTask(req.params.id, req.user.id);
    return new ApiResponse(200, 'Task deleted successfully.').send(res);
  } catch (err) {
    next(err);
  }
};

// ──────────── Admin CRUD ────────────

const adminGetAllTasks = async (req, res, next) => {
  try {
    const { tasks, meta } = await tasksService.getAllTasks(req.query);
    return new ApiResponse(200, 'All tasks fetched successfully.', { tasks }, meta).send(res);
  } catch (err) {
    next(err);
  }
};

const adminDeleteTask = async (req, res, next) => {
  try {
    await tasksService.adminDeleteTask(req.params.id);
    return new ApiResponse(200, 'Task deleted by admin successfully.').send(res);
  } catch (err) {
    next(err);
  }
};

const adminGetAllUsers = async (req, res, next) => {
  try {
    const { users, meta } = await tasksService.getAllUsers(req.query);
    return new ApiResponse(200, 'Users fetched successfully.', { users }, meta).send(res);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  adminGetAllTasks,
  adminDeleteTask,
  adminGetAllUsers,
};
