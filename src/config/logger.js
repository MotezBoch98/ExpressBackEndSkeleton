/**
 * Logger configuration using Winston library.
 * 
 * This logger is configured to log messages at the 'info' level and higher.
 * It uses a combination of timestamp and custom printf format for log messages.
 * 
 * Transports:
 * - Console: Logs all messages to the console.
 * - File (error.log): Logs 'error' level messages to 'logs/error.log'.
 * - File (combined.log): Logs all messages to 'logs/combined.log'.
 * 
 * @module logger
 * @requires winston
 */
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' }),
    ],
});

export default logger;