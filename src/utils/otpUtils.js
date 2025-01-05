import crypto from 'crypto';
import Otp from '../models/Otp.js';

/**
 * Generates a 6-digit OTP (One-Time Password).
 *
 * @returns {string} A 6-digit OTP as a string.
 */
export const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
};

/**
 * Saves an OTP (One-Time Password) for a user with an expiry time of 10 minutes.
 *
 * @param {string} userId - The ID of the user for whom the OTP is being saved.
 * @param {string} otp - The OTP to be saved.
 * @returns {Promise<void>} A promise that resolves when the OTP is saved.
 */
export const saveOtp = async (userId, otp) => {
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
    const otpEntry = new Otp({ userId, otp, otpExpiry });
    await otpEntry.save();
};

/**
 * Verifies the provided OTP for the given user.
 *
 * @param {string} userId - The ID of the user to verify the OTP for.
 * @param {string} otp - The OTP to verify.
 * @throws {Error} If the OTP is invalid or expired.
 * @returns {Promise<void>} A promise that resolves if the OTP is valid.
 */
export const verifyOtp = async (userId, otp) => {
    const otpEntry = await Otp.findOne({ userId, otp });

    if (!otpEntry) {
        throw new Error('Invalid or expired OTP');
    }

    if (otpEntry.otpExpiry < new Date()) {
        await Otp.deleteOne({ _id: otpEntry._id });
        throw new Error('Invalid or expired OTP');
    }

    // OTP is valid, delete it from the database
    await Otp.deleteOne({ _id: otpEntry._id });
};

/**
 * Deletes all OTPs from the database that have expired.
 * 
 * This function queries the database for OTP entries where the `otpExpiry` 
 * field is less than the current date and time, and deletes those entries.
 * 
 * @async
 * @function cleanUpExpiredOtps
 * @returns {Promise<void>} A promise that resolves when the deletion is complete.
 */
export const cleanUpExpiredOtps = async () => {
    await Otp.deleteMany({ otpExpiry: { $lt: new Date() } });
};