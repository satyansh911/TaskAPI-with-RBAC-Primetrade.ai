const ApiError = require('../utils/ApiError');

/**
 * Role guard middleware factory
 * @param {...string} roles - Allowed roles
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required.'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, `Access forbidden. Requires role: ${roles.join(' or ')}.`));
    }
    next();
  };
};

module.exports = { requireRole };
