/**
 * Custom error class for application-specific errors.
 * 
 * @class AppError
 * @extends {Error}
 * 
 * @param {string} message - The error message.
 * @param {number} statusCode - The HTTP status code associated with the error.
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

export default AppError;