import { generateToken, verifyToken, TOKEN_TYPES } from '../src/utils/JWT.js';

describe('JWT Utils', () => {
    it('should generate a token', () => {
        const token = generateToken({ userId: '123' }, TOKEN_TYPES.ACCESS);
        expect(token).toBeDefined();
    });

    it('should verify a token', () => {
        const token = generateToken({ userId: '123' }, TOKEN_TYPES.ACCESS);
        const decoded = verifyToken(token, TOKEN_TYPES.ACCESS);
        expect(decoded).toHaveProperty('userId', '123');
    });
});