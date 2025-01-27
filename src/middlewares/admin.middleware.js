import AppError from '../utils/AppError.js';
import logger from '../config/logger.js';

/**
 * Middleware to check if the user has admin privileges
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const isAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new AppError('Authentication required', 401);
        }

        if (!req.user.roles || !req.user.roles.includes('admin')) {
            logger.warn('Unauthorized admin access attempt', {
                userId: req.user.id
            });
            throw new AppError('Admin access required', 403);
        }

        logger.info('Admin access granted', {
            userId: req.user.id
        });
        next();
    } catch (error) {
        next(error);
    }
};