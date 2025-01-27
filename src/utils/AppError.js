/**
 * Custom error class for application-specific errors
 * @class AppError
 * @extends {Error}
 */
class AppError extends Error {
    /**
     * Creates an instance of AppError
     * @param {string} message - Error message
     * @param {number} statusCode - HTTP status code
     * @param {string} type - Error type (validation|auth|database|operational|programming)
     * @param {Object} metadata - Additional error context
     */
    constructor(message, statusCode, type = 'operational', metadata = {}) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.type = type;
        this.isOperational = type !== 'programming';
        this.timestamp = new Date().toISOString();
        this.metadata = metadata;

        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * Serializes error for logging
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            type: this.type,
            isOperational: this.isOperational,
            timestamp: this.timestamp,
            metadata: this.metadata,
            stack: process.env.NODE_ENV === 'development' ? this.stack : undefined
        };
    }
}

/**
 * Error types enum
 */
export const ErrorTypes = {
    VALIDATION: 'validation',
    AUTHENTICATION: 'auth',
    DATABASE: 'database',
    OPERATIONAL: 'operational',
    PROGRAMMING: 'programming'
};

/**
 * HTTP status codes for different error types
 */
export const ErrorStatusCodes = {
    VALIDATION: 400,
    AUTHENTICATION: 401,
    AUTHORIZATION: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL: 500
};

export default AppError;