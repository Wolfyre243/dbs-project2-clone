const winston = require("winston");
const { combine, timestamp, json, errors } = winston.format;

// Custom format for console output
// TODO: Improve format
const consoleFormat = combine(
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  }),
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    json(),
  ),
  transports: [
    new winston.transports.Console({
      format: combine(timestamp(), consoleFormat),
    }),
    new winston.transports.File({
      filename: "logs/app.log",
      level: "http",
    }),
    new winston.transports.File({
      filename: "logs/errors.log",
      level: "error",
    }),
  ],
  levels: {
    ...winston.config.syslog.levels,
    http: 7,
  },
});

module.exports = logger;
