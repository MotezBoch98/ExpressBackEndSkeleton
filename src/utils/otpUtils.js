import crypto from 'crypto';
import nodemailer from 'nodemailer';
import Otp from '../models/Otp.js';

export const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
};

export const saveOtp = async (userId, otp) => {
    const otpEntry = new Otp({ userId, otp });
    await otpEntry.save();
};

export const sendOtpEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`
    };

    await transporter.sendMail(mailOptions);
};

export const verifyOtp = async (userId, otp) => {
    const otpEntry = await Otp.findOne({ userId, otp });

    if (!otpEntry) {
        throw new Error('Invalid or expired OTP');
    }

    // OTP is valid, delete it from the database
    await Otp.deleteOne({ _id: otpEntry._id });
};