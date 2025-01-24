import * as userService from '../services/profile.service.js';
import logger from '../config/logger.js';

/**
 * Controller to handle fetching the profile of the logged-in user.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const fetchProfile = async (req, res) => {
    const userId = req.user.id; // Assuming user ID is stored in req.user.id
    try {
        const profile = await userService.getProfile(userId);
        res.status(200).json(profile);
    } catch (error) {
        logger.error('Error fetching profile', { message: error.message });
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

/**
 * Controller to handle updating the profile of the logged-in user.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const modifyProfile = async (req, res) => {
    const userId = req.user.id; // Assuming user ID is stored in req.user.id
    const data = req.body;
    try {
        const updatedProfile = await userService.updateProfile(userId, data);
        res.status(200).json(updatedProfile);
    } catch (error) {
        logger.error('Error updating profile', { message: error.message });
        res.status(500).json({ message: 'Error updating profile' });
    }
};