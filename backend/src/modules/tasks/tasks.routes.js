const express = require('express');
const router = express.Router();
const tasksController = require('./tasks.controller');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/role');
const { validate } = require('../../middleware/validate');
const {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} = require('./tasks.validators');

/**
 * @swagger
 * tags:
 *   - name: Tasks
 *     description: Task CRUD for authenticated users
 *   - name: Admin
 *     description: Admin-only operations
 */

// ──────────── User Task Routes (/api/v1/tasks) ────────────

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks for the current user
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, in_progress, done] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [low, medium, high] }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [created_at, due_date, priority, title] }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: Tasks list with pagination metadata
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/tasks',
  authenticate,
  validate(taskQuerySchema, 'query'),
  tasksController.getUserTasks
);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a specific task by ID
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Task found
 *       404:
 *         description: Task not found
 */
router.get('/tasks/:id', authenticate, tasksController.getTaskById);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Complete project documentation
 *               description:
 *                 type: string
 *                 example: Write README and API docs
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, done]
 *                 default: pending
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *               due_date:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-31"
 *     responses:
 *       201:
 *         description: Task created successfully
 *       422:
 *         description: Validation error
 */
router.post(
  '/tasks',
  authenticate,
  validate(createTaskSchema),
  tasksController.createTask
);

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update an existing task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, done]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               due_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Task not found
 */
router.put(
  '/tasks/:id',
  authenticate,
  validate(updateTaskSchema),
  tasksController.updateTask
);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 */
router.delete('/tasks/:id', authenticate, tasksController.deleteTask);

// ──────────── Admin Routes (/api/v1/admin) ────────────

/**
 * @swagger
 * /admin/tasks:
 *   get:
 *     summary: "[ADMIN] Get all tasks from all users"
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, in_progress, done] }
 *     responses:
 *       200:
 *         description: All tasks with user info
 *       403:
 *         description: Forbidden - admin only
 */
router.get(
  '/admin/tasks',
  authenticate,
  requireRole('admin'),
  validate(taskQuerySchema, 'query'),
  tasksController.adminGetAllTasks
);

/**
 * @swagger
 * /admin/tasks/{id}:
 *   delete:
 *     summary: "[ADMIN] Delete any task"
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Task deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 */
router.delete(
  '/admin/tasks/:id',
  authenticate,
  requireRole('admin'),
  tasksController.adminDeleteTask
);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: "[ADMIN] Get all registered users"
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: User list with pagination
 *       403:
 *         description: Forbidden
 */
router.get(
  '/admin/users',
  authenticate,
  requireRole('admin'),
  tasksController.adminGetAllUsers
);

module.exports = router;
