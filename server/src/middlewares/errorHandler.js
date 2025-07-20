const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Enhanced response
  let response = {
    status: err.status,
    message: err.statusCode != 500 ? err.message : 'Internal Server Error',
  };

  // Show stack trace in dev only for easier debugging
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    err.statusCode = 400;
    err.status = 'fail';
    response.message = 'Invalid JSON body!';
  }

  // Log all errors (could be replaced with winston or an external logger)
  // console.error(`[${new Date().toISOString()}]`, err);

  if (err.status != 500) {
    logger.error(err.message);
  } else {
    logger.fatal('Server error', {
      message: err.message,
      stack: err.stack,
      path: req.path,
    });
  }

  // Send response (check if headers already sent)
  if (!res.headersSent) {
    res.status(err.statusCode).json(response);
  }
};
