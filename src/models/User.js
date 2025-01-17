import mongoose from 'mongoose';

/**
 * User Schema
 * 
 * @typedef {Object} User
 * @property {string} name - The name of the user.
 * @property {string} email - The email of the user.
 * @property {string} password - The password of the user.
 * @property {boolean} isVerified - Indicates if the user's email is verified.
 * @property {string} phoneNumber - The phone number of the user.
 * @property {Date} createdAt - The date when the user was created.
 * @property {Date} updatedAt - The date when the user was last updated.
 */
const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        isVerified: { type: Boolean, default: false },
        phoneNumber: { type: String, unique: true, default: null },
    },
    { timestamps: true }
);

export default mongoose.model('User', userSchema);