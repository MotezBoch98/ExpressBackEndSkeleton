import { verifyToken, TOKEN_TYPES } from '../utils/jwtUtils.js';
import User from '../models/User.js'; // Adjust the path to your User model

/**
 * Middleware to authenticate a user based on a provided JWT token.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.header - The headers of the request.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - Returns a 401 status with an error message if authentication fails.
 * @throws {Error} - Throws an error if token verification fails.
 */
export const authenticated = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
        const decoded = verifyToken(token, TOKEN_TYPES.ACCESS);

        const user = await User.findById(decoded.userId);

        if (!user) {
            console.log('User not found');
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log('Token verification failed:', error.message);
        res.status(401).json({ success: false, message: error.message });
    }
};

/**
 * Middleware to check if the user's role is authorized.
 * 
 * @param {string[]} roles - Array of roles that are allowed access.
 * @returns {Function} Middleware function to check the user's role.
 */
export const authorized = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
};

