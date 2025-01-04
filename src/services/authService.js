import User from '../models/User.js';
import { generateToken, verifyToken, TOKEN_TYPES } from '../utils/jwtUtils.js';
import { sendEmail } from '../utils/sendEmail.js';
import {
    createVerificationEmailTemplate,
    createPasswordResetTemplate,
} from '../utils/emailTemplates.js';
import logger from '../config/logger.js';
import bcrypt from 'bcrypt';

/**
 * Registers a new user.
 * 
 * @param {Object} userDetails - The user details.
 * @param {string} userDetails.name - The name of the user.
 * @param {string} userDetails.email - The email of the user.
 * @param {string} userDetails.password - The password of the user.
 * @returns {Promise<Object>} The registered user details.
 * @throws {Error} If the email is already registered or if there is an error sending the verification email.
 */
export const registerUser = async ({ name, email, password }) => {
    logger.info('Registering a new user');

    if (await User.exists({ email })) {
        logger.warn(`Email already registered: ${email}`);
        throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        isVerified: false,
    });

    logger.info(`User created with ID: ${newUser._id}`);

    const verificationToken = generateToken({ userId: newUser._id }, TOKEN_TYPES.VERIFY);
    logger.debug(`Generated verification token: ${verificationToken}`);

    const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${verificationToken}`;
    const emailContent = createVerificationEmailTemplate(name, verificationLink);
    logger.debug(`Created verification email content: ${emailContent}`);

    try {
        await sendEmail(email, 'Verify Your Email', emailContent);
        logger.info(`Verification email sent to: ${email}`);
    } catch (error) {
        logger.error(`Error sending verification email: ${error.message}`);
        throw new Error('Error sending verification email');
    }

    return { id: newUser._id, email: newUser.email };
};

/**
 * Logs in a user.
 * 
 * @param {Object} loginDetails - The login details.
 * @param {string} loginDetails.email - The email of the user.
 * @param {string} loginDetails.password - The password of the user.
 * @returns {Promise<Object>} The login result containing success status, token, and refresh token.
 * @throws {Error} If there is an error during the login process.
 */
export const loginUser = async ({ email, password }) => {
    logger.info('Login attempt', { email });

    try {
        const user = await User.findOne({ email });
        if (!user) {
            logger.warn('User not found', { email });
            return { success: false, message: 'Email not found' };
        }

        logger.debug('Stored hashed password', { userId: user._id });

        const isValidPassword = await bcrypt.compare(password.trim(), user.password);
        logger.debug('Password valid', { isValidPassword });

        if (!isValidPassword) {
            logger.warn('Invalid password attempt', { email });
            return { success: false, message: 'Invalid password' };
        }

        if (!user.isVerified) {
            logger.warn('Unverified email attempt', { email });
            return { success: false, message: 'Please verify your email before logging in' };
        }

        const token = generateToken({ userId: user._id }, TOKEN_TYPES.ACCESS);
        const refreshToken = generateToken({ userId: user._id }, TOKEN_TYPES.REFRESH);

        logger.info('User logged in successfully', { userId: user._id });

        return { success: true, token, refreshToken };
    } catch (error) {
        logger.error('Login error', { message: error.message });
        return { success: false, message: error.message };
    }
};

/**
 * Requests a password reset for a user.
 * 
 * @param {string} email - The email of the user requesting the password reset.
 * @returns {Promise<void>} 
 * @throws {Error} If there is an error sending the password reset email.
 */
export const requestPasswordReset = async (email) => {
    logger.info('Password reset request initiated', { email });

    const user = await User.findOne({ email });
    if (!user) {
        logger.warn('User not found for password reset', { email });
        return;
    }

    const resetToken = generateToken({ userId: user._id }, TOKEN_TYPES.RESET);
    const resetLink = `${process.env.BASE_URL}/api/auth/reset-password?token=${resetToken}`;
    const emailContent = createPasswordResetTemplate(user.name, resetLink);

    logger.debug('Password reset email content created', { resetLink });

    try {
        await sendEmail(email, 'Password Reset Request', emailContent);
        logger.info('Password reset email sent', { email });
    } catch (error) {
        logger.error('Error sending password reset email', { message: error.message });
        throw new Error('Error sending password reset email');
    }
};

/**
 * Resets the password for a user.
 * 
 * @param {string} token - The password reset token.
 * @param {string} newPassword - The new password.
 * @returns {Promise<void>}
 * @throws {Error} If the token is missing, invalid, or if there is an error during the password reset process.
 */
export const resetPassword = async (token, newPassword) => {
    logger.info('Password reset attempt initiated');

    try {
        if (!token) {
            logger.error('Token is missing');
            throw new Error('Token is missing');
        }

        const decoded = verifyToken(token, TOKEN_TYPES.RESET);
        logger.debug('Token verified', { userId: decoded.userId });

        const user = await User.findById(decoded.userId);
        if (!user) {
            logger.warn('User not found for password reset', { userId: decoded.userId });
            throw new Error('User not found');
        }

        user.password = await bcrypt.hash(newPassword, 10); // Securely hash the new password
        await user.save();
        logger.info('Password reset successfully', { userId: user._id });
    } catch (error) {
        logger.error('Error during password reset', { message: error.message });
        throw error;
    }
};

/**
 * Verifies a user's email.
 * 
 * @param {string} token - The email verification token.
 * @returns {Promise<void>}
 * @throws {Error} If the token is invalid, expired, or if there is an error during the email verification process.
 */
export const verifyEmail = async (token) => {
    logger.info('Email verification attempt initiated');

    try {
        const decoded = verifyToken(token, TOKEN_TYPES.VERIFY);
        logger.debug('Token verified', { userId: decoded.userId });

        if (!decoded) {
            logger.error('Invalid or expired token');
            throw new Error('Invalid or expired token');
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            logger.warn('User not found for email verification', { userId: decoded.userId });
            throw new Error('User not found');
        }

        if (user.isVerified) {
            logger.warn('Email already verified', { userId: user._id });
            throw new Error('Email already verified');
        }

        user.isVerified = true;

        await user.save();
        logger.info('Email verified successfully', { userId: user._id });
    } catch (error) {
        logger.error('Error during email verification', { message: error.message });
        throw error;
    }
};

/**
 * Validates a password reset token.
 * 
 * @param {string} token - The password reset token.
 * @returns {Object} The decoded token if valid.
 * @throws {Error} If the token is missing or invalid.
 */
export const validateResetToken = (token) => {
    logger.info('Password reset token validation initiated');

    if (!token) {
        logger.error('Token is missing');
        throw new Error('Token is missing');
    }

    logger.debug('Validating reset token', { token });
    return verifyToken(token, TOKEN_TYPES.RESET);
};
