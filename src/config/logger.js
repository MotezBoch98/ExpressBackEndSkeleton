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

const { combine, timestamp, printf, colorize } = format;

// Define custom log format
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

// Create logger instance
const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        new transports.Console({
            format: combine(
                colorize(),
                logFormat
            )
        }),
        new transports.File({ filename: 'logs/error.log', level: 'error' })
    ],
    exceptionHandlers: [
        new transports.File({ filename: 'logs/exceptions.log' })
    ],
    rejectionHandlers: [
        new transports.File({ filename: 'logs/rejections.log' })
    ]
});

export default logger;