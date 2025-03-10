import express from 'express';
import passport from '../config/passport.js';
import { register, login, requestPasswordReset, resetPassword, verifyEmail, showResetPasswordForm, requestEmailVerificationOtp, verifyEmailOtp, requestPhoneVerificationOtp, verifyPhoneOtp, me, oauthCallback } from '../controllers/auth.controller.js';
import validate from '../middlewares/validate.middleware.js';
import { authenticated } from '../middlewares/auth.middleware.js';
import { registerUserSchema, loginUserSchema } from '../validations/user.validation.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoints for user authentication and authorization
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Create a new user account by providing name, email, and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *               phoneNumber:
 *                 type: String
 *                 example: "+21634567890"
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Invalid input
 */
router.post('/signup', validate(registerUserSchema), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User login
 *     description: Authenticate a user by email and password, and return an access token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Invalid email or password
 */
router.post('/login', validate(loginUserSchema), login);

/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Verify email address
 *     description: Verify a user's email using a token sent via email.
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         description: Email verification token
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.get('/verify-email', verifyEmail);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current authenticated user
 *     description: Returns the authenticated user's details.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticated, me);

/**
 * @swagger
 * /api/auth/request-otp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Request OTP for email verification
 *     description: Sends an OTP to the user's email for verification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *     responses:
 *       200:
 *         description: OTP sent to email
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/request-otp', requestEmailVerificationOtp);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify OTP for email verification
 *     description: Verifies the OTP sent to the user's email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               otp:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/verify-otp', verifyEmailOtp);

/**
 * @swagger
 * /api/auth/request-password-reset:
 *   post:
 *     tags:
 *       - Password Management
 *     summary: Request password reset
 *     description: Request a password reset link to be sent to the user's email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *     responses:
 *       200:
 *         description: Password reset link sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password reset email sent
 *       400:
 *         description: User not found
 */
router.post('/request-password-reset', requestPasswordReset);

/**
 * @swagger
 * /api/auth/reset-password:
 *   get:
 *     tags:
 *       - Password Management
 *     summary: Verify password reset token
 *     description: Verify the password reset token received via email.
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT token received via email
 *     responses:
 *       200:
 *         description: Token verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Token verified, proceed with password reset
 *       400:
 *         description: Invalid or expired token
 *   post:
 *     tags:
 *       - Password Management
 *     summary: Reset user password
 *     description: Reset the password using a verified token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: JWT token received via email
 *                 example: some.jwt.token
 *               newPassword:
 *                 type: string
 *                 description: New password
 *                 example: NewPassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password updated successfully
 *       400:
 *         description: Invalid or expired token
 */
router.route('/reset-password').get(showResetPasswordForm).post(resetPassword);

/**
 * @swagger
 * /api/auth/request-phone-otp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Request OTP for phone verification
 *     description: Sends an OTP to the user's phone number for verification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: +1234567890
 *     responses:
 *       200:
 *         description: OTP sent to phone
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/request-phone-otp', requestPhoneVerificationOtp);

/**
 * @swagger
 * /api/auth/verify-phone-otp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify OTP for phone verification
 *     description: Verifies the OTP sent to the user's phone number.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: +1234567890
 *               otp:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Phone number verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/verify-phone-otp', verifyPhoneOtp);

// Google OAuth routes

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Google OAuth login
 *     description: Redirects the user to Google for authentication.
 *     responses:
 *       302:
 *         description: Redirect to Google for authentication
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: true }));

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Google OAuth callback
 *     description: Handles the callback from Google after authentication.
 *     responses:
 *       200:
 *         description: Successfully authenticated with Google
 *       302:
 *         description: Redirect to login on failure
 */
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), oauthCallback);

// Added failure endpoint for testing
router.get('/failure', (req, res) => {
    res.status(401).json({ success: false, message: 'Authentication failed' });
});

// Facebook OAuth routes

/**
 * @swagger
 * /api/auth/facebook:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Facebook OAuth login
 *     description: Redirects the user to Facebook for authentication.
 *     responses:
 *       302:
 *         description: Redirect to Facebook for authentication
 */
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

/**
 * @swagger
 * /api/auth/facebook/callback:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Facebook OAuth callback
 *     description: Handles the callback from Facebook after authentication.
 *     responses:
 *       200:
 *         description: Successfully authenticated with Facebook
 *       302:
 *         description: Redirect to login on failure
 */
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), oauthCallback);

export default router;