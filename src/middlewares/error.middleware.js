import logger from '../config/logger.js';
import AppError from '../utils/AppError.js';

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
    // Log the error
    logger.error('Error:', err.toJSON());

    // If it's a trusted error (operational), send error details
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            type: err.type,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }

    // For programming or unknown errors, send generic message in production
    return res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' 
            ? err.message 
            : 'Something went wrong'
    });
};

/**
 * 404 error handler for undefined routes
 */
export const notFoundHandler = (req, res, next) => {
    next(new AppError(`Route not found: ${req.originalUrl}`, 404, 'operational'));
};