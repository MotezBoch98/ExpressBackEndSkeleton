import logger from '../config/logger.js';
import AppError from '../utils/AppError.js';

// Helper to safely serialize errors
const serializeError = (err) => {
    if (err instanceof AppError) {
        return {
            message: err.message,
            name: err.name,
            statusCode: err.statusCode,
            type: err.type,
            stack: err.stack,
            isOperational: err.isOperational
        };
    }

    return {
        message: err.message,
        name: err.name || 'Error',
        stack: err.stack,
        type: 'unexpected_error'
    };
};

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
    // Serialize error before logging
    const errorDetails = serializeError(err);

    // Log with appropriate level
    if (err.isOperational) {
        logger.warn('Operational error:', errorDetails);
    } else {
        logger.error('Unexpected error:', errorDetails);
    }

    // Response formatting
    const response = {
        success: false,
        message: err.isOperational
            ? err.message
            : 'An unexpected error occurred'
    };

    // Add stack trace in development
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
        response.errorType = err.name;
    }

    res.status(err.statusCode || 500).json(response);
};

/**
 * 404 error handler for undefined routes
 */
export const notFoundHandler = (req, res, next) => {
    next(new AppError(`Route not found: ${req.originalUrl}`, 404, 'route_not_found'));
};