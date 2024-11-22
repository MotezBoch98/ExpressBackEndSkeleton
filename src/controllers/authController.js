import * as authService from '../services/authService.js';
import EmailVerificationToken from '../models/EmailVerificationToken.js';
import User from '../models/User.js';

/**
 * Registers a new user.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The request body containing user registration data.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} - A promise that resolves when the registration process is complete.
 */
export const register = async (req, res) => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const token = await authService.loginUser(req.body);
        res.status(200).json({ success: true, token });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const requestPasswordReset = async (req, res) => {
    try {
        await authService.requestPasswordReset(req.body.email);
        res.status(200).json({ success: true, message: 'Password reset link sent to email' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        await authService.resetPassword(req.body.token, req.body.newPassword);
        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        // Find the verification token in the database
        const verificationToken = await EmailVerificationToken.findOne({ token });
        if (!verificationToken) {
            throw new Error('Invalid or expired token');
        }

        // Find the user and verify their email
        const user = await User.findById(verificationToken.userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Mark the user as verified
        user.isVerified = true;
        await user.save();

        // Delete the token to prevent reuse
        await verificationToken.deleteOne();

        res.status(200).json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const generateOTP = async (req, res) => {
    try {
        const userId = req.body.userId;
        await authService.generateOTP(userId);
        res.status(200).json({ success: true, message: 'OTP generated and sent to email' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        await authService.verifyOTP(userId, otp);
        res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
