// File: src/config/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../models/User.js';
import logger from '../config/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const configurePassport = () => {
    // Google Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
        passReqToCallback: true
    },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;

                let user = await User.findOne({
                    $or: [
                        { email },
                        { providerId: profile.id }
                    ]
                });

                if (!user) {
                    user = await User.create({
                        name: profile.displayName,
                        email,
                        provider: 'google',
                        providerId: profile.id,
                        isVerified: true
                    });
                } else if (!user.providerId) {
                    // Merge existing email account with Google auth
                    user.provider = 'google';
                    user.providerId = profile.id;
                    await user.save();
                }

                return done(null, user);
            } catch (error) {
                logger.error('Google auth error:', {
                    error: error.message,
                    profile: profile._json
                });
                return done(error);
            }
        }));

    // Facebook Strategy
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}/api/auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'emails'],
        passReqToCallback: true
    }, async (req, accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value;
            const user = await User.findOrCreateSocialUser({
                provider: 'facebook',
                id: profile.id,
                emails: profile.emails,
                displayName: profile.displayName
            });

            logger.info('Facebook authentication successful', {
                userId: user._id,
                providerId: profile.id,
                isNewUser: !user.createdAt
            });

            return done(null, user);
        } catch (error) {
            logger.error('Facebook authentication failed', {
                error: error.message,
                profile: profile._json
            });
            return done(error);
        }
    }));

    // Serialization/Deserialization
    passport.serializeUser((user, done) => done(null, user._id));
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });

    return passport;
};

export default configurePassport();