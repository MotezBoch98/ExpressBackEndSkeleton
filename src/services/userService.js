import User from '../models/User.js';
import bcrypt from 'bcrypt';

/**
 * Creates a new user. This method is meant to be used by admins.
 *
 * @param {Object} data - The data to create the user with.
 * @param {string} data.password - The password for the new user.
 * @param {string} data.email - The email for the new user.
 * @param {string} data.name - The name of the new user.
 * @returns {Promise<Object>} The created user object (without the password).
 * @throws {Error} If there is an issue creating the user.
 */
export const createUser = async (data) => {
    logger.info('Creating a new user');
    try {
        const { password, ...otherData } = data;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            ...otherData,
            password: hashedPassword
        });

        // Save the user
        await user.save();
        logger.info('User created successfully');
        return user; // You might want to exclude the password from the response
    } catch (error) {
        logger.error('Error creating user', { message: error.message });
        throw error;
    }
}

/**
 * Fetches all users from the database.
 * 
 * @async
 * @function getAllUsers
 * @returns {Promise<Array>} A promise that resolves to an array of user objects.
 * @throws Will throw an error if there is an issue fetching the users.
 */
export const getAllUsers = async () => {
    logger.info('Fetching all users');
    try {
        const users = await User.find();
        logger.info('Users fetched successfully', { count: users.length });
        return users;
    } catch (error) {
        logger.error('Error fetching users', { message: error.message });
        throw error;
    }
}

/**
 * Fetches a user by their ID.
 *
 * @param {string} id - The ID of the user to fetch.
 * @returns {Promise<Object>} The user object if found.
 * @throws {Error} If the user is not found or if there is an error during fetching.
 */
export const getUserById = async (id) => {
    logger.info('Fetching user');
    try {
        const user = await User.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    } catch (error) {
        logger.error('Fetching user failed', { message: error.message });
        throw error;
    }
}

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
}

/**
 * Updates the details of a user by their ID.
 *
 * @param {string} id - The ID of the user to update.
 * @param {Object} data - The data to update the user with.
 * @param {string} [data.password] - The new password for the user (if provided, it will be hashed).
 * @param {Object} data.otherUpdates - Other fields to update for the user.
 * @returns {Promise<Object>} The updated user object.
 * @throws {Error} If the user with the given ID is not found.
 */
export const updateUser = async (id, data) => {
    const { password, ...otherUpdates } = data;
    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        otherUpdates.password = hashedPassword;
    }

    const user = await User.findByIdAndUpdate(id, otherUpdates, { new: true });
    if (!user) throw new Error("Couldn't find user with that ID");
    return user;
}

/**
 * Deletes a user by their ID. This method is meant to be used by admins.
 *
 * @param {string} id - The ID of the user to delete.
 * @returns {Promise<Object>} The deleted user object.
 * @throws {Error} If the user is not found or there is an error during deletion.
 */
export const deleteUser = async (id) => {
    logger.info('Deleting user');
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            throw new Error('User not found');
        }
        logger.info('User deleted successfully');
        return user;
    } catch (error) {
        logger.error('Error deleting user', { message: error.message });
        throw error;
    }
}
