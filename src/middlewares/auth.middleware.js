import { verifyToken, TOKEN_TYPES } from '../utils/jwtUtils.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import logger from '../config/logger.js';

export const authenticated = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new AppError('No token provided', 401);
        }

        const decoded = verifyToken(token, TOKEN_TYPES.ACCESS);
        const user = await User.findById(decoded.userId);

        if (!user) {
            logger.warn('User not found with token', { userId: decoded.userId });
            throw new AppError('User not found', 401);
        }

        req.user = user;
        logger.info('User authenticated', { userId: user.id });
        next();
    } catch (error) {
        logger.error('Authentication failed', { error: error.message });
        next(new AppError(error.message, 401));
    }
};

export const authorized = (roles) => (req, res, next) => {
    try {
        if (!req.user) {
            throw new AppError('User not authenticated', 401);
        }

        if (!Array.isArray(roles)) {
            throw new AppError('Roles must be an array', 500);
        }

        if (!roles.includes(req.user.role)) {
            logger.warn('Unauthorized access attempt', {
                userId: req.user.id,
                requiredRoles: roles,
                userRole: req.user.role
            });
            throw new AppError('Access denied', 403);
        }

        logger.info('Access authorized', {
            userId: req.user.id,
            role: req.user.role
        });
        next();
    } catch (error) {
        next(error);
    }
};