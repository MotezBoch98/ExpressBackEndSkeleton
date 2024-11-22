import User from '../models/User.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import EmailVerificationToken from '../models/EmailVerificationToken.js';
import { sendEmail } from '../utils/sendEmail.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';
import dotenv from 'dotenv';

dotenv.config();


export const registerUser = async ({ name, email, password }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error('Email already in use');

    const user = new User({ name, email, password });
    await user.save();

    // Generate a JWT for email verification
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Generate verification link
    const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${token}`;
    const emailContent = `
    <div>
        <p>Hi ${name},</p>
        <p>Thank you for registering. Please verify your email by clicking the link below:</p>
        <a href="${verificationLink}" target="_blank" style="color:blue; text-decoration:underline;">Verify Email</a>
        <p>If you did not request this, please ignore this email.</p>
    </div>
`;

    await sendEmail(user.email, 'Verify Your Email', emailContent);

    return { id: user._id, email: user.email };
};


export const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid credentials');
    }

    // Check if email is verified
    if (!user.isVerified) {
        throw new Error('Email is not verified. Please check your inbox and verify your account.');
    }

    // Generate and return the JWT token
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};


export const requestPasswordReset = async (email) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');

    const token = crypto.randomBytes(32).toString('hex');
    await new PasswordResetToken({ userId: user._id, token }).save();

    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    await sendEmail(user.email, 'Password Reset Request', `Click the link to reset your password: ${resetLink}`);
};

export const resetPassword = async (token, newPassword) => {
    const resetToken = await PasswordResetToken.findOne({ token });
    if (!resetToken) throw new Error('Invalid or expired token');

    const user = await User.findById(resetToken.userId);
    if (!user) throw new Error('User not found');

    user.password = newPassword;
    await user.save();

    await resetToken.deleteOne(); // Invalidate the token
};

export const generateOTP = async (userId) => {
    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    await sendEmail(user.email, 'Your OTP', `Your OTP is: ${otp}`);
};

export const verifyOTP = async (userId, otp) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    if (user.otp !== otp || user.otpExpiry < Date.now()) {
        throw new Error('Invalid or expired OTP');
    }

    user.otp = null; // Clear OTP after verification
    user.otpExpiry = null;
    await user.save();
};
