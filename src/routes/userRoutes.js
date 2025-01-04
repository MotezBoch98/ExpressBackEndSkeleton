import express from 'express';
import {getAllUsers, getProfile, getUserById, updateUser} from '../controllers/userController.js'; 

const router = express.Router();

/**
 *  @swagger 
 * tags:
 *   name: Profile Management
 *   description: Endpoints for user profile management
 */

router.get('/allUsers', getAllUsers);

router.get('/user/:id', getUserById);

router.put('/user/:id', updateUser);

router.get('/profile', getProfile);

export default router;