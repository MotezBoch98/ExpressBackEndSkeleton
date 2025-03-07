import express from 'express';
import { fetchProfile, modifyProfile } from "../controllers/profile.controller.js";
import validate from '../middlewares/validate.middleware.js';
import { authenticated } from "../middlewares/auth.middleware.js";
import { updateUserSchema } from '../validations/user.validation.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Profile Management
 *   description: Endpoints for profile management
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
 *                 _id:
 *                   type: string
 *                   description: The user ID
 *                 name:
 *                   type: string
 *                   description: The user's name
 *                 email:
 *                   type: string
 *                   description: The user's email
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticated, fetchProfile);

/**
 * @swagger
 * /api/profile-management/profile:
 *   put:
 *     summary: Update the profile of the logged-in user
 *     tags: [Profile Management]
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
 *                 description: The user's name
 *               email:
 *                 type: string
 *                 description: The user's email
 *     responses:
 *       200:
 *         description: Successfully updated profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The user ID
 *                 name:
 *                   type: string
 *                   description: The user's name
 *                 email:
 *                   type: string
 *                   description: The user's email
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/', authenticated, validate(updateUserSchema), modifyProfile);

export default router;