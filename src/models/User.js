import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
}, { timestamps: true });

/**
 * Pre-save hook for the User model.
 * Hashes the user's password before saving to the database if it has been modified.
 * @async
 * @function
 * @this {mongoose.Document} The document being saved
 * @returns {Promise<void>}
 */
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

export default mongoose.model('User', userSchema);

