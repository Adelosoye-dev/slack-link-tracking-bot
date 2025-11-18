const winston = require('winston');
const path = require('path');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, stack, ...metadata }) => {
    let msg = `${timestamp} [${level}] ${message}`;

    if (stack) {
      msg += `\n${stack}`;
    }

    if (Object.keys(metadata).length > 0) {
      // Filter out empty or internal winston properties
      const filteredMetadata = Object.keys(metadata)
        .filter(key => !['timestamp', 'level', 'message', 'stack'].includes(key))
        .reduce((obj, key) => {
          obj[key] = metadata[key];
          return obj;
        }, {});

      if (Object.keys(filteredMetadata).length > 0) {
        msg += ` ${JSON.stringify(filteredMetadata)}`;
      }
    }

    return msg;
  })
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}] ${message}`;

    if (Object.keys(metadata).length > 0) {
      // Filter out empty or internal winston properties
      const filteredMetadata = Object.keys(metadata)
        .filter(key => !['timestamp', 'level', 'message'].includes(key))
        .reduce((obj, key) => {
          obj[key] = metadata[key];
          return obj;
        }, {});

      if (Object.keys(filteredMetadata).length > 0) {
        msg += ` ${JSON.stringify(filteredMetadata)}`;
      }
    }

    return msg;
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Console transport for all logs
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

module.exports = logger;
