import * as userService from '../services/user.service.js';

/**
 * Retrieves all users from the database and sends them in the response.
 * 
 * @async
 * @function fetchAllUsers
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the list of users or an error message.
*/
export const fetchAllUsers = async (req, res) => {
    try {
        const users = await userService.fetchAllUsers();
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Creates a new user in the database.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.body - The data for the new user.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the created user or an error message.
 */
export const createUser = async (req, res) => {
    try {
        const newUser = await userService.createUser(req.body);
        res.status(201).json({ success: true, data: newUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get user by ID.
*
* @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.id - User ID.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 */
export const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

/**
 * Updates a user with the given ID and request body.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the user to update.
 * @param {Object} req.body - The request body containing the user data to update.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the user is updated.
 */
export const updateUser = async (req, res) => {
    try {
        const updatedUser = await userService.updateUser(req.params.id, req.body);
        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

/**
 * Deletes a user from the database.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.id - User ID.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A promise that resolves when the user is deleted.
 */
export const deleteUser = async (req, res) => {
    try {
        const deletedUser = await userService.deleteUser(req.params.id);
        res.status(200).json({ success: true, data: deletedUser });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};
