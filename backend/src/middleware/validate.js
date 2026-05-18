const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Joi validation middleware factory
 * @param {import('joi').Schema} schema - Joi schema to validate against
 * @param {'body'|'query'|'params'} target - Request property to validate
 */
const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,   // collect all errors
      stripUnknown: true,  // remove unknown keys
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.context?.key || d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      }));
      return next(new ApiError(422, 'Validation failed.', errors));
    }

    req[target] = value; // replace with sanitized value
    next();
  };
};

module.exports = { validate };
