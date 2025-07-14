const morgan = require("morgan");
const logger = require("../utils/logger");

const stream = {
  write: (message) => {
    // Remove newline character
    logger.http(message.trim());
  },
};

// Custom token to capture response time in ms
// TODO: Add more custom headers
morgan.token("response-time-ms", (req, res) => {
  return `${res.getHeader("X-Response-Time")}ms`;
});

// Custom format combining Morgan and Winston
const morganFormat = ":remote-addr :method :url :status :response-time-ms";

// Middleware function
const loggerMiddleware = morgan(morganFormat, { stream });

module.exports = loggerMiddleware;
