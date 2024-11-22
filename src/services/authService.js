import User from '../models/User.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import EmailVerificationToken from '../models/EmailVerificationToken.js';
import { sendEmail } from '../utils/sendEmail.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';


export const registerUser = async ({ name, email, password }) => {
    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error('Email already in use');

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    // Generate and hash token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(token, 10);

    // Save the hashed token
    await new EmailVerificationToken({ userId: user._id, token: hashedToken }).save();

    // Generate verification link
    const verificationLink = `${process.env.BASE_URL}/verify-email?token=${token}`;

    // Send verification email
    await sendEmail(
        user.email,
        'Verify Your Email',
        `Click the link to verify your email: ${verificationLink}`
    );

    return { id: user._id, email: user.email };
};


export const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid credentials');
    }
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
