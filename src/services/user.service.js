import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import logger from '../config/logger.js';

/**
 * Create a new user
 * @param {Object} data - User data
 * @returns {Promise<Object>} The created user object
 */
export const createUser = async (data) => {
    try {
        const user = new User(data);
        await user.save();
        logger.info('User created successfully');
        return user;
    } catch (error) {
        logger.error('Error creating user', { message: error.message });
        throw error;
    }
};

/**
 * Fetch all users
 * @returns {Promise<Array>} Array of user objects
 */
export const fetchAllUsers = async () => {
    try {
        const users = await User.find();
        logger.info('Users fetched successfully', { count: users.length });
        return users;
    } catch (error) {
        logger.error('Error fetching users', { message: error.message });
        throw error;
    }
};

/**
 * Fetch a user by ID
 * @param {string} id - User ID
 * @returns {Promise<Object>} The user object
 */
export const getUserById = async (id) => {
    try {
        const user = await User.findById(id);
        if (!user) throw new AppError('User not found', 404);
        return user;
    } catch (error) {
        logger.error('Error fetching user', { message: error.message });
        throw error;
    }
};

/**
 * Update a user by ID
 * @param {string} id - User ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} The updated user object
 */
export const updateUser = async (id, data) => {
    try {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        const user = await User.findByIdAndUpdate(id, data, { new: true });
        if (!user) throw new AppError('User not found', 404);
        return user;
    } catch (error) {
        logger.error('Error updating user', { message: error.message });
        throw error;
    }
};

/**
 * Delete a user by ID
 * @param {string} id - User ID
 * @returns {Promise<Object>} The deleted user object
 */
export const deleteUser = async (id) => {
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) throw new AppError('User not found', 404);
        logger.info('User deleted successfully');
        return user;
    } catch (error) {
        logger.error('Error deleting user', { message: error.message });
        throw error;
    }
};
