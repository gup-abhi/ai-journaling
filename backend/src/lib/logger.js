import winston from 'winston';
import path from 'path';

const logger = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.splat(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ level, message, timestamp }) => {
            return `${timestamp} ${level}: ${message}`;
        })
      ),
    }),
  ],
});

if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({ 
    filename: path.join('logs', 'error.log'), 
    level: 'error',
    format: winston.format.combine(
      winston.format.splat(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ level, message, timestamp }) => {
          return `${timestamp} ${level}: ${message}`;
      })
    ),
  }));
  logger.add(new winston.transports.File({ 
    filename: path.join('logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.splat(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ level, message, timestamp }) => {
          return `${timestamp} ${level}: ${message}`;
      })
    ),
  }));
}

export default logger;
