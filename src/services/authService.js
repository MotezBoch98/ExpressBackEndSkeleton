import User from '../models/User.js';
import Otp from '../models/Otp.js';
import { sendEmail } from '../utils/sendEmail.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';
import dotenv from 'dotenv';

dotenv.config();

export const registerUser = async ({ name, email, password }) => {
    console.log('Registering user:', email);
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error('Email already in use');

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
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
    console.log('User registered successfully:', email);

    return { id: user._id, email: user.email };
};

export const loginUser = async ({ email, password }) => {
    console.log('Logging in user:', email);
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid credentials');
    }

    if (!user.isVerified) {
        throw new Error('Email is not verified. Please check your inbox and verify your account.');
    }

    console.log('User logged in successfully:', email);
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

export const requestPasswordReset = async (email, token) => {
    try {
        console.log('Requesting password reset for:', email);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email });
        if (!user) throw new Error('User not found');

        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const resetLink = `http://localhost:5000/reset-password?token=${resetToken}`;
        await sendEmail(user.email, 'Password Reset Request', `Click the link to reset your password: ${resetLink}`);
        console.log('Password reset email sent:', email);
    } catch (error) {
        console.error('Error requesting password reset:', error.message);
        throw new Error('Invalid token');
    }
};

export const resetPassword = async (token, newPassword) => {
    try {
        console.log('Resetting password with token:', token);
        const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
        const userId = decoded.id;

        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        user.password = newPassword;
        await user.save();
        console.log('Password reset successfully for user:', user.email);
    } catch (error) {
        console.error('Error resetting password:', error.message);
        throw new Error('Invalid or expired token');
    }
};

export const generateOTP = async (userId) => {
    console.log('Generating OTP for user:', userId);
    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP to the database
    await Otp.create({ userId, otp, otpExpiry });

    await sendEmail(user.email, 'Your OTP', `Your OTP is: ${otp}`);
    console.log('OTP generated and sent to email:', user.email);
};

export const verifyOTP = async (userId, otp) => {
    console.log('Verifying OTP for user:', userId);
    const user = await User.findById(userId);
    if (!user) {
        console.error('User not found');
        throw new Error('User not found');
    }

    const otpRecord = await Otp.findOne({ userId, otp });
    if (!otpRecord) {
        console.error('Invalid OTP');
        throw new Error('Invalid OTP');
    }

    if (otpRecord.otpExpiry < Date.now()) {
        console.error('Expired OTP');
        throw new Error('Expired OTP');
    }

    // Delete OTP record after verification
    await Otp.deleteOne({ _id: otpRecord._id });

    console.log('OTP verified successfully for user:', user.email);
};
