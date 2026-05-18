const Joi = require('joi');

const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().trim().messages({
    'string.min': 'Title cannot be empty',
    'string.max': 'Title must not exceed 200 characters',
    'any.required': 'Title is required',
  }),
  description: Joi.string().max(2000).allow('', null).optional().trim(),
  status: Joi.string()
    .valid('pending', 'in_progress', 'done')
    .default('pending')
    .messages({
      'any.only': 'Status must be one of: pending, in_progress, done',
    }),
  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .default('medium')
    .messages({
      'any.only': 'Priority must be one of: low, medium, high',
    }),
  due_date: Joi.date().iso().allow(null).optional().messages({
    'date.format': 'Due date must be a valid ISO date (YYYY-MM-DD)',
  }),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).trim().optional(),
  description: Joi.string().max(2000).allow('', null).optional().trim(),
  status: Joi.string().valid('pending', 'in_progress', 'done').optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  due_date: Joi.date().iso().allow(null).optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

const taskQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('pending', 'in_progress', 'done').optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  sort: Joi.string().valid('created_at', 'due_date', 'priority', 'title').default('created_at'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});

module.exports = { createTaskSchema, updateTaskSchema, taskQuerySchema };
