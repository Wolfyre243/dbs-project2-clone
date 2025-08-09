const winston = require('winston');
const { combine, timestamp, json, errors } = winston.format;

// Custom format for console output
const consoleFormat = combine(
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  }),
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json(),
  ),
  transports: [
    new winston.transports.Console({
      format: combine(timestamp(), consoleFormat),
    }),
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: '/tmp/logs/app.log',
            level: 'http',
          }),
          new winston.transports.File({
            filename: '/tmp/logs/errors.log',
            level: 'error',
          }),
        ]
      : [
          new winston.transports.File({
            filename: 'logs/app.log',
            level: 'http',
          }),
          new winston.transports.File({
            filename: 'logs/errors.log',
            level: 'error',
          }),
        ]),
  ],
  levels: {
    ...winston.config.syslog.levels,
    http: 7,
  },
});

module.exports = logger;
