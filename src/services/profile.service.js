import User from '../models/User.js';
import logger from '../config/logger.js';

/**
 * Fetches the profile of the logged-in user.
 *
 * @param {string} id - The ID of the logged-in user.
 * @returns {Promise<Object>} The profile object containing safe, public fields.
 * @throws {Error} If the user is not found or if there is an error during fetching.
 */
export const getProfile = async (id) => {
    logger.info('Fetching user profile');
    try {
        // Fetch user and exclude sensitive fields like password
        const profile = await User.findById(id, { password: 0, roles: 0 });
        if (!profile) {
            throw new Error('Profile not found');
        }
        logger.info('Profile fetched successfully');
        return profile;
    } catch (error) {
        logger.error('Fetching profile failed', { message: error.message });
        throw error;
    }
};

/**
 * Updates the profile of the logged-in user.
 *
 * @param {string} userId - The ID of the logged-in user.
 * @param {Object} data - The data to update the profile with.
 * @returns {Promise<Object>} The updated profile object.
 * @throws {Error} If the user is not found or if there is an error during updating.
 */
export const updateProfile = async (userId, data) => {
    logger.info('Updating user profile');
    try {
        const updatedProfile = await User.findByIdAndUpdate(userId, data, { new: true, select: '-password' });
        if (!updatedProfile) {
            throw new Error('Profile not found');
        }
        logger.info('Profile updated successfully');
        return updatedProfile;
    } catch (error) {
        logger.error('Updating profile failed', { message: error.message });
        throw error;
    }
};
