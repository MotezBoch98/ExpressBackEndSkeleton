import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

/**
 * User Schema
 *
 * @typedef {Object} User
 * @property {String} name - The name of the user. Required.
 * @property {String} email - The email of the user. Required, unique, and validated.
 * @property {String} password - The password of the user. Required.
 * @property {Boolean} isVerified - Whether the user's email is verified. Defaults to false.
 * @property {String} phoneNumber - The phone number of the user. Unique and optional.
 * @property {String} role - The role of the user. Can be 'client', 'admin', or 'delivery'. Defaults to 'client'.
 * @property {Date} createdAt - The date when the user was created. Automatically managed.
 * @property {Date} updatedAt - The date when the user was last updated. Automatically managed.
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Please provide a valid email address'],
    },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    phoneNumber: { type: String, unique: true, sparse: true },
    role: {
      type: String,
      enum: ['client', 'admin', 'delivery'],
      default: 'client',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password; // Exclude password from JSON responses
        return ret;
      },
    },
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Instance Methods
userSchema.methods = {
  /**
   * Check if the given password matches the hashed password
   * @param {string} inputPassword - The password to validate
   * @returns {Promise<boolean>} True if passwords match
   */
  isPasswordValid: function (inputPassword) {
    return bcrypt.compare(inputPassword, this.password);
  },
};

// Static Methods
userSchema.statics = {
  /**
   * Find a user by email
   * @param {string} email - The email to search for
   * @returns {Promise<User>} The user object if found
   */
  findByEmail: function (email) {
    return this.findOne({ email });
  },
};

export default mongoose.model('User', userSchema);