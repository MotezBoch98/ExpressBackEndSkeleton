import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';
import { sendSms } from '../utils/sendSms.js';
import { createVerificationEmailTemplate, createPasswordResetTemplate } from '../utils/emailTemplates.js';
import { generateToken, verifyToken, TOKEN_TYPES } from '../utils/jwtUtils.js';
import { generateOtp, saveOtp, verifyOtp, cleanUpExpiredOtps } from '../utils/otpUtils.js';
import logger from '../config/logger.js';
import AppError from '../utils/AppError.js';
import bcrypt from 'bcrypt';

/**
 * Registers a new user.
 * 
 * @param {Object} userData - The user details.
 * @param {string} userDetails.name - The name of the user.
 * @param {string} userDetails.email - The email of the user.
 * @param {string} userDetails.password - The password of the user.
 * @param {string} userDetails.phoneNumber - The phone number of the user.
 * @returns {Promise<Object>} The registered user details.
 * @throws {AppError} If the email is already registered or there is an error during registration.
 */
export const registerUser = async ({ name, email, password, phoneNumber, provider, role }) => {
    logger.info('Registering a new user');

    if (await User.exists({ email })) {
        logger.warn(`Email already registered: ${email}`);
        throw new AppError('Email already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        provider: provider || 'local',
        role: role || 'client'
    });

    logger.info(`User created with ID: ${newUser._id}`);

    const verificationToken = generateTokenService({ userId: newUser._id }, TOKEN_TYPES.VERIFY);
    logger.debug(`Generated verification token: ${verificationToken}`);

    const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${verificationToken}`;
    const emailContent = createVerificationEmailTemplate(name, verificationLink);

    try {
        await sendEmail(email, 'Verify Your Email', emailContent);
        logger.info(`Verification email sent to: ${email}`);
    } catch (error) {
        logger.error(`Error sending verification email: ${error.message}`);
        await newUser.deleteOne(); // Delete the user if email sending fails
        throw new AppError('Error sending verification email', 500);
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
 * @throws {AppError} If the email or password is invalid.
 */
export const loginUser = async ({ email, password }) => {
    logger.info('Login attempt', { email });

    const user = await User.findOne({ email }).select('+password +provider');
    if (!user) {
        logger.warn('User not found', { email });
        throw new AppError('Invalid email or password', 401);
    }

    // Handle social auth users trying to use password login
    if (user.provider !== 'local') {
        logger.warn('Invalid authentication method', {
            email,
            provider: user.provider
        });
        throw new AppError(`Please use ${user.provider} login`, 403);
    }

    const isValidPassword = await user.isPasswordValid(password);
    if (!isValidPassword) {
        logger.warn('Invalid password attempt', { email });
        throw new AppError('Invalid email or password', 401);
    }

    if (!user.isVerified) {
        logger.warn('Unverified email attempt', { email });
        throw new AppError('Please verify your email before logging in', 403);
    }

    const token = generateTokenService({ userId: user._id }, TOKEN_TYPES.ACCESS);
    const refreshToken = generateTokenService({ userId: user._id }, TOKEN_TYPES.REFRESH);

    return { success: true, token, refreshToken };
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

    const user = await User.findByEmail(email);
    if (!user) {
        logger.warn('User not found for password reset', { email });
        return; // Avoid exposing whether the email exists
    }

    const resetToken = generateTokenService({ userId: user.id }, TOKEN_TYPES.RESET);
    const resetLink = `${process.env.BASE_URL}/api/auth/reset-password?token=${resetToken}`;
    const emailContent = createPasswordResetTemplate(user.name, resetLink);

    try {
        await sendEmail(user.email, 'Password Reset Request', emailContent);
        logger.info('Password reset email sent', { email });
    } catch (error) {
        logger.error('Error sending password reset email', { message: error.message });
        throw new AppError('Error sending password reset email', 500);
    }
};

/**
 * Resets the password for a user.
 * 
 * @param {string} token - The password reset token.
 * @param {string} newPassword - The new password.
 * @returns {Promise<void>}
 * @throws {AppError} If the token is invalid or if there is an error during the password reset process.
 */
export const resetPassword = async (token, newPassword) => {
    logger.info('Password reset attempt initiated');

    if (!token) {
        logger.error('Token is missing');
        throw new AppError('Token is missing', 400);
    }

    const decoded = verifyTokenService(token, TOKEN_TYPES.RESET);
    logger.debug('Token verified', { userId: decoded.userId });

    const user = await User.findById(decoded.userId);
    if (!user) {
        logger.warn('User not found for password reset', { userId: decoded.userId });
        throw new AppError('User not found', 404);
    }

    user.password = newPassword;
    await user.save();
    logger.info('Password reset successfully', { userId: user._id });
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
        const decoded = verifyTokenService(token, TOKEN_TYPES.VERIFY);
        const user = await User.findById(decoded.userId);

        if (!user) {
            logger.warn('User not found for email verification', { userId: decoded.userId });
            throw new AppError('User not found', 404);
        }

        if (user.isVerified) {
            logger.warn('Email already verified', { userId: user.id });
            throw new AppError('Email already verified', 400);
        }

        user.isVerified = true;
        await user.save();

        logger.info('Email verified successfully', { userId: user.id });
    } catch (error) {
        logger.error('Error during email verification', { message: error.message });
        throw new AppError(error.message, 400);
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
        throw new AppError('Token is missing', 400);
    }

    return verifyTokenService(token, TOKEN_TYPES.RESET);
};

/**
 * Sends an email verification OTP to the specified email address.
 *
 * @param {string} email - The email address to send the OTP to.
 * @throws {Error} If the user is not found.
 * @returns {Promise<void>} A promise that resolves when the OTP has been sent.
 */
export const requestEmailVerificationOtp = async (email) => {
    const user = await User.findByEmail(email);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    const otp = generateOtp();
    await saveOtp(user.id, otp);

    const subject = 'Your OTP Code';
    const htmlContent = `<p>Your OTP code is ${otp}</p>`;
    await sendEmail(email, subject, htmlContent);

    logger.info(`OTP sent to ${email}`);
};

/**
 * Requests a phone verification OTP for the given phone number.
 *
 * @param {string} phone - The phone number to request the OTP for.
 * @throws {Error} If the user with the given phone number is not found.
 * @returns {Promise<void>} A promise that resolves when the OTP has been sent.
 */
export const requestPhoneVerificationOtp = async (phoneNumber) => {
    const user = await User.findOne({ phoneNumber });
    if (!user) {
        throw new AppError('User not found', 404);
    }

    const otp = generateOtp();
    await saveOtp(user.id, otp);

    const message = `Your OTP code is ${otp}`;
    await sendSms(phoneNumber, message);

    logger.info(`OTP sent to ${phoneNumber}`);
};

/**
 * Verifies the OTP (One Time Password) for a given email.
 *
 * @param {string} email - The email address of the user to verify.
 * @param {string} otp - The OTP to verify.
 * @throws {Error} If the user is not found or OTP verification fails.
 * @returns {Promise<void>} A promise that resolves when the email is successfully verified.
 */
export const verifyEmailOtp = async (email, otp) => {
    const user = await User.findByEmail(email);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    await verifyOtp(user.id, otp);

    user.isVerified = true;
    await user.save();

    logger.info(`Email verified for ${email}`);
};

/**
 * Verifies the OTP for a given phone number.
 *
 * @param {string} phone - The phone number to verify.
 * @param {string} otp - The OTP to verify.
 * @throws {Error} If the user is not found or OTP verification fails.
 * @returns {Promise<void>} A promise that resolves when the phone number is successfully verified.
 */
export const verifyPhoneOtp = async (phoneNumber, otp) => {
    const user = await User.findOne({ phoneNumber });
    if (!user) {
        throw new AppError('User not found', 404);
    }

    await verifyOtp(user.id, otp);

    user.isVerified = true;
    await user.save();

    logger.info(`Phone number verified for ${phoneNumber}`);
};

/**
 * Cleans up expired OTPs by calling the cleanUpExpiredOtps function.
 * Logs an informational message once the cleanup is complete.
 * 
 * @async
 * @function cleanUpOtps
 * @returns {Promise<void>} A promise that resolves when the cleanup is complete.
 */
export const cleanUpOtps = async () => {
    await cleanUpExpiredOtps();
    logger.info('Expired OTPs cleaned up');
};

/**
 * Generates a token for the user.
 * 
 * @param {Object} payload - The payload to include in the token.
 * @param {string} type - The type of token to generate.
 * @returns {string} The generated token.
 */
export const generateTokenService = (payload, type) => {
    return generateToken(payload, type);
};

/**
 * Verifies the provided token based on the specified type.
 *
 * @param {string} token - The token to be verified.
 * @param {string} type - The type of the token.
 * @returns {boolean} - Returns true if the token is valid, otherwise false.
 */
export const verifyTokenService = (token, type) => {
    return verifyToken(token, type);
};