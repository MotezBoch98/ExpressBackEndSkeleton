import User from '../models/User.js';
import { generateToken, verifyToken, TOKEN_TYPES } from '../utils/JWT.js';
import { sendEmail } from '../utils/sendEmail.js';
import {
    createVerificationEmailTemplate,
    createPasswordResetTemplate,
} from '../utils/emailTemplates.js';
import logger from '../config/logger.js';
import bcrypt from 'bcrypt';

export const registerUser = async ({ name, email, password }) => {
    if (await User.exists({ email })) throw new Error('Email already registered');

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        isVerified: false,
    });

    const verificationToken = generateToken({ userId: newUser._id }, TOKEN_TYPES.VERIFY);
    console.log(verificationToken);
    const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${verificationToken}`;
    const emailContent = createVerificationEmailTemplate(name, verificationLink);
    console.log(emailContent);

    try {
        await sendEmail(email, 'Verify Your Email', emailContent);
    } catch (error) {
        logger.error(`Error sending verification email: ${error.message}`);
    }

    return { id: newUser._id, email: newUser.email };
};
export const loginUser = async ({ email, password }) => {
    try {
        console.log('Login attempt:', { email, password });

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return { success: false, message: 'Email not found' };
        }

        console.log('Stored hashed password:', user.password);

        const isValidPassword = await bcrypt.compare(password.trim(), user.password);
        console.log('Password valid:', isValidPassword);

        if (!isValidPassword) {
            return { success: false, message: 'Invalid password' };
        }

        if (!user.isVerified) {
            return { success: false, message: 'Please verify your email before logging in' };
        }

        const token = generateToken({ userId: user._id }, TOKEN_TYPES.ACCESS);
        const refreshToken = generateToken({ userId: user._id }, TOKEN_TYPES.REFRESH);

        return { success: true, token, refreshToken };
    } catch (error) {
        console.error('Login error:', error.message);
        return { success: false, message: error.message };
    }
};

// export const loginUser = async ({ email, password }) => {
//     try {
//         // Fetch the user from the database
//         const user = await User.findOne({ email: 'motazbouchhiwa@gmail.com' });
//         console.log('Stored Password (Hashed):', user.password);

//         // Hash a sample password to compare
//         const testPassword = 'Password123';
//         const isMatch = await bcrypt.compare(testPassword, user.password);
//         console.log('Password Match:', isMatch);

//         if (!user) {
//             return { success: false, message: 'Email not found' };
//         }

//         const isValidPassword = await bcrypt.compare(password, user.password);
//         if (!isValidPassword) {
//             return { success: false, message: 'Invalid password' };
//         }

//         if (!user.isVerified) {
//             return { success: false, message: 'Please verify your email before logging in' };
//         }

//         const token = generateToken({ userId: user._id }, TOKEN_TYPES.ACCESS);
//         const refreshToken = generateToken({ userId: user._id }, TOKEN_TYPES.REFRESH);
//         return { success: true, token };
//     } catch (error) {
//         return { success: false, message: error.message };
//     }
// };

export const requestPasswordReset = async (email) => {
    const user = await User.findOne({ email });
    if (!user) return;

    const resetToken = generateToken({ userId: user._id }, TOKEN_TYPES.RESET);
    const resetLink = `${process.env.BASE_URL}/api/auth/reset-password?token=${resetToken}`;
    const emailContent = createPasswordResetTemplate(user.name, resetLink);

    try {
        await sendEmail(email, 'Password Reset Request', emailContent);
    } catch (error) {
        logger.error(`Error sending password reset email: ${error.message}`);
    }
};

export const resetPassword = async (token, newPassword) => {
    try {
        if (!token) {
            throw new Error('Token is missing');
        }

        const decoded = verifyToken(token, TOKEN_TYPES.RESET);

        const user = await User.findById(decoded.userId);
        if (!user) {
            throw new Error('User not found');
        }

        user.password = await bcrypt.hash(newPassword, 10); // Securely hash the new password
        await user.save();
    } catch (error) {
        throw error;
    }
};


export const verifyEmail = async (token) => {
    // Decode the token and verify its type
    const decoded = verifyToken(token, TOKEN_TYPES.VERIFY);
    console.log(decoded);
    if (!decoded) throw new Error('Invalid or expired token');

    // Find the user by the ID embedded in the token
    const user = await User.findById(decoded.userId);
    if (!user) throw new Error('User not found');

    // Check if the user's email is already verified
    if (user.isVerified) throw new Error('Email already verified');

    // Mark the user's email as verified
    user.isVerified = true;

    // Save the updated user object to the database
    await user.save();
};

export const validateResetToken = (token) => {
    if (!token) {
        throw new Error('Token is missing');
    }
    console.log('Validating reset token:', token);
    return verifyToken(token, TOKEN_TYPES.RESET);
};
