import express from 'express';
import { getAllUsers, getProfile, getUserById, updateUser, deleteUser } from '../controllers/user.controller.js';
import validate from '../middlewares/validate.middleware.js';
import { authorized, authenticated } from '../middlewares/auth.middleware.js';
import { updateUserSchema } from '../validations/user.validation.js';

const router = express.Router();

/**
 *  @swagger 
 * tags:
 *   name: Profile Management
 *   description: Endpoints for user profile management
 */

/**
 * @swagger
 * /api/profile-management/profile:
 *   get:
 *     summary: Get the profile of the logged-in user
 *     tags: [Profile Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */
router.get('/profile', authenticated, getProfile);

/**
 * @swagger
 * /api/profile-management/allUsers:
 *   get:
 *     summary: Get a list of all users
 *     tags: [Profile Management]
 *     responses:
 *       200:
 *         description: Successfully retrieved list of users
 *       401:
 *         description: Unauthorized
 */
router.get('/allUsers', authenticated, authorized(['admin']), getAllUsers);

/**
 * @swagger
 * /api/profile-management/user/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Profile Management]
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
router.get('/user/:id', authenticated, authorized(['admin', 'client']), getUserById);

/**
 * @swagger
 * /api/profile-management/user/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [Profile Management]
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
 * /api/profile-management/user/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Profile Management]
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
router.delete('/user/:id', authenticated, deleteUser);

export default router;