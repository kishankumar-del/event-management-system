const AppError = require('../utils/AppError');

/**
 * Role-Based Access Control (RBAC) middleware
 * Restricts route access to specified roles
 * @param  {...string} roles - Allowed roles (e.g. 'admin', 'organizer', 'attendee')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access forbidden: role '${req.user?.role || 'anonymous'}' is not authorized for this resource.`,
          403
        )
      );
    }
    next();
  };
};

module.exports = authorizeRoles;
