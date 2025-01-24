import express from 'express';
import { fetchAllUsers, createUser, getUserById, updateUser, deleteUser } from '../controllers/user.controller.js';
import validate from '../middlewares/validate.middleware.js';
import { authorized, authenticated } from '../middlewares/auth.middleware.js';
import { updateUserSchema } from '../validations/user.validation.js';

const router = express.Router();

/**
 *  @swagger 
 * tags:
 *   name: User Management
 *   description: Endpoints for user management
 */

/**
 * @swagger
 * /api/user-management/allUsers:
 *   get:
 *     summary: Get a list of all users
 *     tags: [User Management]
 *     responses:
 *       200:
 *         description: Successfully retrieved list of users
 *       401:
 *         description: Unauthorized
 */
router.get('/allUsers', authenticated, authorized(['admin']), fetchAllUsers);

/**
 * @swagger
 * /api/user-management/user/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [User Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Successfully retrieved user
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get('/user/:id', authenticated, getUserById);

/**
 * @swagger
 * /api/user-management/create-user:
 *   post:
 *     summary: Create a new user
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the user
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 description: The email of the user
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 description: The password for the user
 *                 example: password123
 *               role:
 *                 type: string
 *                 description: The role of the user
 *                 example: client
 *     responses:
 *       201:
 *         description: User successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the newly created user
 *                   example: 63f16a2c8a6e8a35b6d9f1e5
 *                 name:
 *                   type: string
 *                   description: The name of the user
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   description: The email of the user
 *                   example: johndoe@example.com
 *                 role:
 *                   type: string
 *                   description: The role of the user
 *                   example: client
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/create-user', authenticated, authorized(['admin']), createUser);

/**
 * @swagger
 * /api/user-management/user/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [User Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated user
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.put('/user/:id', authenticated, authorized(['admin']), validate(updateUserSchema), updateUser);

/**
 * @swagger
 * /api/user-management/user/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [User Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Successfully deleted user
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/user/:id', authenticated, authorized(['admin']), deleteUser);

export default router;