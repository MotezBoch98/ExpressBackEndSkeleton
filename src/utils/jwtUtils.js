import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Token types enumeration.
 */
export const TOKEN_TYPES = {
    ACCESS: 'access',
    REFRESH: 'refresh',
    RESET: 'reset',
    VERIFY: 'verify'
};

/**
 * Configuration object for different types of JWT tokens.
 * 
 * @typedef {Object} TokenConfig
 * @property {string} secret - The secret key used to sign the token.
 * @property {string} expiresIn - The duration after which the token expires.
 * 
 * @type {Object.<string, TokenConfig>}
 * @property {TokenConfig} ACCESS - Configuration for access tokens.
 * @property {TokenConfig} REFRESH - Configuration for refresh tokens.
 * @property {TokenConfig} RESET - Configuration for reset tokens.
 * @property {TokenConfig} VERIFY - Configuration for verification tokens.
 */
const tokenConfigs = {
    [TOKEN_TYPES.ACCESS]: {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m'
    },
    [TOKEN_TYPES.REFRESH]: {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d'
    },
    [TOKEN_TYPES.RESET]: {
        secret: process.env.JWT_RESET_SECRET,
        expiresIn: '1h'
    },
    [TOKEN_TYPES.VERIFY]: {
        secret: process.env.JWT_SECRET,
        expiresIn: '24h'
    }
};

/**
 * Generates a JWT token.
 * 
 * @param {Object} payload - The payload to encode in the token.
 * @param {string} type - The type of token to generate.
 * @returns {string} The generated JWT token.
 * @throws {Error} If the token type is invalid.
 */
export const generateToken = (payload, type) => {
    const config = tokenConfigs[type];
    if (!config) throw new Error('Invalid token type');
    return jwt.sign(payload, config.secret, { expiresIn: config.expiresIn });
};

/**
 * Verifies a JWT token.
 * 
 * @param {string} token - The token to verify.
 * @param {string} type - The type of token to verify.
 * @returns {Object} The decoded token payload.
 * @throws {Error} If the token type is invalid or the token is expired/invalid.
 */
export const verifyToken = (token, type) => {
    const config = tokenConfigs[type];
    if (!config) throw new Error('Invalid token type');
    try {
        return jwt.verify(token, config.secret);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expired');
        } else {
            throw new Error('Invalid token');
        }
    }
};