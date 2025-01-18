import mongoose from 'mongoose';

/**
 * User Schema
 * 
 * @typedef {Object} User
 * @property {String} name - The name of the user. This field is required.
 * @property {String} email - The email of the user. This field is required and must be unique.
 * @property {String} password - The password of the user. This field is required.
 * @property {Boolean} isVerified - Indicates whether the user's email is verified. Defaults to false.
 * @property {String} phoneNumber - The phone number of the user. This field is unique and defaults to null.
 * @property {String} role - The role of the user. Can be 'client', 'admin', or 'delivery'. Defaults to 'client'.
 * @property {Date} createdAt - The date when the user was created. Automatically managed by Mongoose.
 * @property {Date} updatedAt - The date when the user was last updated. Automatically managed by Mongoose.
 */
const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        isVerified: { type: Boolean, default: false },
        phoneNumber: { type: String, unique: true, default: null },
        role: { type: String, enum: ['client','admin','delivery'], default: 'client' },
    },
    { timestamps: true }
);

export default mongoose.model('User', userSchema);