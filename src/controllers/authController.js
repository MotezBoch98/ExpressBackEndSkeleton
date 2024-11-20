import * as authService from '../services/authService.js';

/**
 * Registers a new user.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The request body containing user registration data.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} - A promise that resolves when the registration process is complete.
 */
export const register = async (req, res) => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * Authenticates a user and generates a login token.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The request body containing user login credentials.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} - A promise that resolves when the login process is complete.
 */
export const login = async (req, res) => {
    try {
        const token = await authService.loginUser(req.body);
        res.status(200).json({ success: true, token });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

