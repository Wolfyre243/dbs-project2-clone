const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

module.exports = (req, res, next) => {
  logger.warning(`Route not found: ${req.method} ${req.path}`);
  // If user tries to access non-existing route
  next(new AppError(`Resource not found - ${req.originalUrl}`, 404));
};
