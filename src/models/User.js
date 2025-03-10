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
    password: {
      type: String,
      required: function () {
        return this.provider === 'local'; // Conditional requirement
      }
    },
    provider: {
      type: String,
      enum: ['local', 'google', 'facebook'],
      default: 'local',
      required: true
    },
    providerId: {
      type: String,
      unique: true,
      sparse: true // Allows null for local users
    },
    isVerified: {
      type: Boolean,
      default: function () {
        return this.provider !== 'local'; // Auto-verify social logins
      }
    },
    phoneNumber: {
      type: String,
      sparse: true // Remove unique if you want to allow nulls
    },
    role: {
      type: String,
      enum: ['client', 'admin', 'delivery'],
      default: 'client'
    }
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

// Indexes for faster querying
userSchema.index({ provider: 1, providerId: 1 }, { unique: true, sparse: true });

// Hash password before saving
userSchema.pre('save', function (next) {
  // Only hash password for local users when modified
  if (this.provider === 'local' && !this.isModified('password')) { return next(); }
  this.password = bcrypt.hash(this.password, 10);
  next();
});

// Custom validation for social auth users
userSchema.pre('validate', function (next) {
  if (this.provider !== 'local') {
    this.isVerified = true; // Auto-verify social logins
    if (this.password) {
      this.invalidate('password', 'Social auth users should not have passwords');
    }
  }
  next();
});


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
  findOrCreateSocialUser: async function (profile) {
    const { provider, id: providerId } = profile;
    const email = profile.emails?.[0]?.value;

    // Check existing user
    const existingUser = await this.findOne({
      $or: [
        { provider, providerId },
        { email }
      ]
    });

    if (existingUser) {
      if (!existingUser.providerId) {
        // Merge accounts if email exists but no social ID
        existingUser.provider = provider;
        existingUser.providerId = providerId;
        await existingUser.save();
      }
      return existingUser;
    }

    // Create new social user
    return this.create({
      name: profile.displayName,
      email,
      provider,
      providerId,
      isVerified: true
    });
  }

};

// Instance Methods
userSchema.methods = {
  /**
   * Check if the given password matches the hashed password
   * @param {string} inputPassword - The password to validate
   * @returns {Promise<boolean>} True if passwords match
   */
  isPasswordValid: function (inputPassword) {
    if (this.provider !== 'local') {
      throw new Error('Password authentication not available for social users');
    }
    return bcrypt.compare(inputPassword, this.password);
  },
};

export default mongoose.model('User', userSchema);