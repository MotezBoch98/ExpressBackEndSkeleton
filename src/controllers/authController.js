import * as authService from '../services/authService.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js'; // Add this import

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
        console.log('Registering user:', req.body.email);
        const user = await authService.registerUser(req.body);
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        console.error('Error registering user:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        console.log('Logging in user:', req.body.email);
        const token = await authService.loginUser(req.body);
        res.status(200).json({ success: true, token });
    } catch (error) {
        console.error('Error logging in user:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Requesting password reset for:', email);
        const user = await User.findOne({ email });
        if (!user) throw new Error('User not found');

        const resetToken = jwt.sign(
            { id: user._id },
            process.env.JWT_RESET_SECRET,
            { expiresIn: '1h' }
        );

        const resetLink = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;
        await sendEmail(
            user.email,
            'Password Reset Request',
            `<p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 1 hour.</p>`
        );
        console.log('Password reset email sent:', email);
        res.status(200).json({ success: true, message: 'Password reset email sent' });
    } catch (error) {
        console.error('Error requesting password reset:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        console.log('Resetting password with token:', req.body.token);
        await authService.resetPassword(req.body.token, req.body.newPassword);
        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error resetting password:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        console.log('Verifying email with token:', token);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: 'Email is already verified' });
        }

        user.isVerified = true;
        await user.save();

        res.status(200).json({ success: true, message: 'Email verified successfully' });
        console.log('Email verified successfully for user:', user.email);
    } catch (error) {
        console.error('Error verifying email:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const generateOTP = async (req, res) => {
    try {
        const userId = req.body.userId;
        console.log('Generating OTP for user:', userId);
        await authService.generateOTP(userId);
        res.status(200).json({ success: true, message: 'OTP generated and sent to email' });
    } catch (error) {
        console.error('Error generating OTP:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        console.log('Verifying OTP for user:', userId);
        await authService.verifyOTP(userId, otp);
        res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } catch (error) {
        console.error('Error verifying OTP:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};
