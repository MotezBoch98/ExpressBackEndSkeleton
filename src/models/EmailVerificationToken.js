import mongoose from 'mongoose';

const emailVerificationTokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 }, // Expires after 1 hour
});

export default mongoose.model('EmailVerificationToken', emailVerificationTokenSchema);
