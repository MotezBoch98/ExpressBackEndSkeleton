import * as authService from '../services/auth.service.js';
import logger from '../config/logger.js';

/**
 * Registers a new user.
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing user details.
 * @param {string} req.body.name - The name of the user.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {string} req.body.phoneNumber - The phone number of the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
export const register = async (req, res) => {
    logger.info('Registering a new user');
    try {
        const user = await authService.registerUser(req.body);
        logger.info('User registered successfully', { userId: user._id });
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        logger.error('Error registering user', { error: error.message });
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * Logs in a user.
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing login details.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
export const login = async (req, res) => {
    logger.info('Logging in user', { email: req.body.email });
    try {
        const result = await authService.loginUser(req.body);

        if (!result.success) {
            logger.warn('Login failed', { email: req.body.email });
            return res.status(400).json({ success: false, message: result.message });
        }

        logger.info('User logged in successfully', { email: req.body.email });
        res.status(200).json({ success: true, token: result.token });
    } catch (error) {
        logger.error('Error logging in user', { error: error.message });
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Returns the currently authenticated user's information.
 *
 * @param {Object} req - Express request object; `req.user` is populated by the auth middleware.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
export const me = (req, res) => {
    // If using Mongoose, convert the document to an object to remove sensitive fields
    const userData = req.user.toObject ? req.user.toObject() : req.user;
    
    // Remove sensitive fields like the password
    delete userData.password;
  
    res.status(200).json({ success: true, data: { user: userData } });
  };

/**
 * Verifies a user's email.
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.query - The query parameters.
 * @param {string} req.query.token - The email verification token.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
export const verifyEmail = async (req, res) => {
    logger.info('Verifying email', { token: req.query.token });
    try {
        await authService.verifyEmail(req.query.token);
        logger.info('Email verified successfully');
        res.status(200).json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        logger.error('Error verifying email', { error: error.message });
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * Requests a password reset for a user.
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing the user's email.
 * @param {string} req.body.email - The email of the user requesting the password reset.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
export const requestPasswordReset = async (req, res) => {
    logger.info('Requesting password reset', { email: req.body.email });
    try {
        await authService.requestPasswordReset(req.body.email);
        logger.info('Password reset email sent', { email: req.body.email });
        res.status(200).json({ success: true, message: 'Password reset email sent' });
    } catch (error) {
        logger.error('Error requesting password reset', { error: error.message });
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * Displays the reset password form.
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.query - The query parameters.
 * @param {string} req.query.token - The password reset token.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
export const showResetPasswordForm = async (req, res) => {
    logger.info('Displaying reset password form', { token: req.query.token });
    try {
        const token = req.query.token;

        authService.validateResetToken(token);

        res.send(`
            <html>
                <head>
                    <title>Reset Password</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            max-width: 400px;
                            margin: 40px auto;
                            padding: 20px;
                        }
                        div {
                            margin-bottom: 15px;
                        }
                        input {
                            width: 100%;
                            padding: 8px;
                            margin-top: 5px;
                        }
                        button {
                            padding: 10px 15px;
                            background-color: #007bff;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                        }
                    </style>
                </head>
                <body>
                    <h2>Reset Your Password</h2>
                    <form action="/api/auth/reset-password" method="POST">
                        <input type="hidden" name="token" value="${token}" />
                        <div>
                            <label>New Password:</label>
                            <input type="password" name="newPassword" required />
                        </div>
                        <div>
                            <label>Confirm New Password:</label>
                            <input type="password" name="confirmPassword" required />
                        </div>
                        <button type="submit">Reset Password</button>
                    </form>
                </body>
            </html>
        `);
    } catch (error) {
        logger.error('Error displaying reset password form', { error: error.message });
        res.status(400).send(`
            <html>
                <body>
                    <h2>Error</h2>
                    <p>${error.message}</p>
                </body>
            </html>
        `);
    }
};

/**
 * Resets the password for a user.
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing the token and new passwords.
 * @param {string} req.body.token - The password reset token.
 * @param {string} req.body.newPassword - The new password.
 * @param {string} req.body.confirmPassword - The confirmation of the new password.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
export const resetPassword = async (req, res) => {
    logger.info('Resetting password', { token: req.body.token });
    try {
        const { token, newPassword, confirmPassword } = req.body;

        if (!token) {
            logger.warn('Token is missing');
            return res.status(400).json({ success: false, message: 'Token is missing' });
        }

        if (newPassword !== confirmPassword) {
            logger.warn('Passwords do not match');
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }

        await authService.resetPassword(token, newPassword);
        logger.info('Password updated successfully');
        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        logger.error('Error resetting password', { error: error.message });
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * Handles the request to send an email verification OTP.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.email - The email address to send the OTP to.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the OTP has been sent.
 */
export const requestEmailVerificationOtp = async (req, res) => {
    logger.info('Requesting email verification OTP', { email: req.body.email });
    try {
        await authService.requestEmailVerificationOtp(req.body.email);
        logger.info('OTP sent to email', { email: req.body.email });
        res.status(200).json({ success: true, message: 'OTP sent to email' });
    } catch (error) {
        logger.error(`Error requesting OTP for email verification: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Verifies the OTP for email verification.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.email - The email address to verify.
 * @param {string} req.body.otp - The OTP to verify.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the OTP verification is complete.
 */
export const verifyEmailOtp = async (req, res) => {
    logger.info('Verifying email OTP', { email: req.body.email });
    try {
        await authService.verifyEmailOtp(req.body.email, req.body.otp);
        logger.info('Email verified successfully', { email: req.body.email });
        res.status(200).json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        logger.error(`Error verifying OTP for email verification: ${error.message}`);
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * Handles the request to send an OTP to a phone number for verification.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.phoneNumber - The phone number to send the OTP to.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the OTP has been sent.
 */
export const requestPhoneVerificationOtp = async (req, res) => {
    logger.info('Requesting phone verification OTP', { phoneNumber: req.body.phoneNumber });
    try {
        await authService.requestPhoneVerificationOtp(req.body.phoneNumber);
        logger.info('OTP sent to phone', { phoneNumber: req.body.phoneNumber });
        res.status(200).json({ success: true, message: 'OTP sent to phone' });
    } catch (error) {
        logger.error(`Error requesting OTP for phone verification: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Verifies the OTP for phone number verification.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.phoneNumber - The phone number to verify.
 * @param {string} req.body.otp - The OTP to verify.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the OTP verification is complete.
 */
export const verifyPhoneOtp = async (req, res) => {
    logger.info('Verifying phone OTP', { phoneNumber: req.body.phoneNumber });
    try {
        await authService.verifyPhoneOtp(req.body.phoneNumber, req.body.otp);
        logger.info('Phone number verified successfully', { phoneNumber: req.body.phoneNumber });
        res.status(200).json({ success: true, message: 'Phone number verified successfully' });
    } catch (error) {
        logger.error(`Error verifying OTP for phone verification: ${error.message}`);
        res.status(400).json({ success: false, message: error.message });
    }
};