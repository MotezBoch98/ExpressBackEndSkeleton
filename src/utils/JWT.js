import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const TOKEN_TYPES = {
    ACCESS: 'access',
    REFRESH: 'refresh',
    RESET: 'reset',
    VERIFY: 'verify'
};

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

export const generateToken = (payload, type) => {
    const config = tokenConfigs[type];
    if (!config) throw new Error('Invalid token type');
    return jwt.sign(payload, config.secret, { expiresIn: config.expiresIn });
};

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