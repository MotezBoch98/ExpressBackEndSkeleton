import bcrypt from 'bcrypt';
import * as JWT from '../src/utils/jwtUtils.js';
import * as emailUtils from '../src/utils/sendEmail.js';
import logger from '../src/config/logger.js';
import User from '../src/models/User.js';
import * as authService from '../src/services/authService.js';

describe('AuthService Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('registerUser', () => {
        it('should register a new user and send a verification email', async () => {
            const mockUser = { _id: 'userId', email: 'motazbouchhiwa@gmail.com', save: jest.fn() };

            jest.spyOn(User, 'exists').mockResolvedValue(false);
            jest.spyOn(User, 'create').mockResolvedValue(mockUser);
            jest.spyOn(emailUtils, 'sendEmail').mockResolvedValue(true);
            jest.spyOn(JWT, 'generateToken').mockReturnValue('mockToken');

            const result = await authService.registerUser({
                name: 'Test User',
                email: 'motazbouchhiwa@gmail.com',
                password: 'password123'
            });

            expect(result.email).toEqual(mockUser.email);
            expect(User.exists).toHaveBeenCalledWith({ email: 'motazbouchhiwa@gmail.com' });
            expect(emailUtils.sendEmail).toHaveBeenCalledWith(
                'motazbouchhiwa@gmail.com',
                'Verify Your Email',
                expect.stringContaining('mockToken')
            );
        });

        it('should throw an error if the email is already registered', async () => {
            jest.spyOn(User, 'exists').mockResolvedValue(true);

            await expect(
                authService.registerUser({
                    name: 'Test User',
                    email: 'motazbouchhiwa@gmail.com',
                    password: 'password123',
                })
            ).rejects.toThrow('Email already registered');
        });
    });

    describe('loginUser', () => {
        it('should login a user with correct credentials', async () => {
            const mockUser = {
                _id: 'userId',
                email: 'motazbouchhiwa@gmail.com',
                password: 'hashedPassword',
                isVerified: true,
            };

            jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
            jest.spyOn(JWT, 'generateToken').mockReturnValue('mockAccessToken');

            const result = await authService.loginUser({
                email: 'motazbouchhiwa@gmail.com',
                password: 'password123',
            });

            expect(result.success).toBe(true);
            expect(result.token).toBe('mockAccessToken');
        });

        it('should return an error for invalid password', async () => {
            const mockUser = {
                email: 'motazbouchhiwa@gmail.com',
                password: 'hashedPassword',
                isVerified: true,
            };

            jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

            const result = await authService.loginUser({
                email: 'motazbouchhiwa@gmail.com',
                password: 'wrongPassword',
            });

            expect(result.success).toBe(false);
            expect(result.message).toBe('Invalid password');
        });
    });

    describe('requestPasswordReset', () => {
        it('should send a password reset email', async () => {
            const mockUser = { _id: 'userId', email: 'motazbouchhiwa@gmail.com', name: 'Test User' };

            jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
            jest.spyOn(emailUtils, 'sendEmail').mockResolvedValue(true);
            jest.spyOn(JWT, 'generateToken').mockReturnValue('mockResetToken');

            await authService.requestPasswordReset('motazbouchhiwa@gmail.com');

            expect(emailUtils.sendEmail).toHaveBeenCalledWith(
                'motazbouchhiwa@gmail.com',
                'Password Reset Request',
                expect.stringContaining('mockResetToken')
            );
        });

        it('should not throw an error if the email does not exist', async () => {
            jest.spyOn(User, 'findOne').mockResolvedValue(null);

            await expect(
                authService.requestPasswordReset('nonexistent@example.com')
            ).resolves.not.toThrow();
        });
    });

    describe('resetPassword', () => {
        it('should reset a password successfully', async () => {
            const mockUser = { save: jest.fn() };

            jest.spyOn(JWT, 'verifyToken').mockReturnValue({ userId: 'userId' });
            jest.spyOn(User, 'findById').mockResolvedValue(mockUser);
            jest.spyOn(bcrypt, 'hash').mockResolvedValue('newHashedPassword');

            await authService.resetPassword('mockResetToken', 'newPassword123');

            expect(mockUser.save).toHaveBeenCalled();
        });

        it('should throw an error if the token is invalid', async () => {
            jest.spyOn(JWT, 'verifyToken').mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await expect(
                authService.resetPassword('invalidToken', 'newPassword123')
            ).rejects.toThrow('Invalid token');
        });
    });
});