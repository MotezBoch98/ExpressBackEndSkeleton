import User from '../src/models/User.js';
import { sendEmail } from '../src/utils/sendEmail.js';
import { sendSms } from '../src/utils/sendSms.js';
import { createVerificationEmailTemplate, createPasswordResetTemplate } from '../src/utils/emailTemplates.js';
import { generateToken, verifyToken, TOKEN_TYPES } from '../src/utils/jwtUtils.js';
import { generateOtp, saveOtp, verifyOtp, cleanUpExpiredOtps } from '../src/utils/otpUtils.js';
import * as authService from '../src/services/auth.service.js';

jest.mock('../src/models/User.js');
jest.mock('../src/utils/sendEmail.js');
jest.mock('../src/utils/sendSms.js');
jest.mock('../src/utils/emailTemplates.js');
jest.mock('../src/utils/jwtUtils.js');
jest.mock('../src/utils/otpUtils.js');
jest.mock('../src/config/logger.js');

describe('Auth Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('registerUser', () => {
        it('should register a new user successfully', async () => {
            User.exists.mockResolvedValue(false);
            User.create.mockResolvedValue({ _id: 'userId', email: 'test@example.com', deleteOne: jest.fn() });
            generateToken.mockReturnValue('verificationToken');
            createVerificationEmailTemplate.mockReturnValue('emailContent');
            sendEmail.mockResolvedValue();

            const userData = { name: 'Test User', email: 'test@example.com', password: 'password', phoneNumber: '1234567890' };
            const result = await authService.registerUser(userData);

            expect(User.exists).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(User.create).toHaveBeenCalledWith(expect.objectContaining(userData));
            expect(generateToken).toHaveBeenCalledWith({ userId: 'userId' }, TOKEN_TYPES.VERIFY);
            expect(sendEmail).toHaveBeenCalledWith('test@example.com', 'Verify Your Email', 'emailContent');
            expect(result).toEqual({ id: 'userId', email: 'test@example.com' });
        });

        it('should throw an error if email is already registered', async () => {
            User.exists.mockResolvedValue(true);

            const userData = { name: 'Test User', email: 'test@example.com', password: 'password', phoneNumber: '1234567890' };

            await expect(authService.registerUser(userData)).rejects.toThrow('Email already registered');
            expect(User.exists).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(User.create).not.toHaveBeenCalled();
            expect(sendEmail).not.toHaveBeenCalled();
        });

        it('should delete user and throw error if sending verification email fails', async () => {
            const mockDelete = jest.fn();
            User.exists.mockResolvedValue(false);
            User.create.mockResolvedValue({ _id: 'userId', email: 'test@example.com', deleteOne: mockDelete });
            generateToken.mockReturnValue('verificationToken');
            createVerificationEmailTemplate.mockReturnValue('emailContent');
            sendEmail.mockRejectedValue(new Error('Email service down'));

            const userData = { name: 'Test User', email: 'test@example.com', password: 'password', phoneNumber: '1234567890' };

            await expect(authService.registerUser(userData)).rejects.toThrow('Error sending verification email');
            expect(User.exists).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(User.create).toHaveBeenCalled();
            expect(sendEmail).toHaveBeenCalled();
            expect(mockDelete).toHaveBeenCalled();
        });
    });

    describe('loginUser', () => {
        beforeEach(() => {
            jest.resetAllMocks();
        });

        it('should login successfully with valid credentials', async () => {
            const mockUser = { 
                _id: 'userId', 
                email: 'test@example.com', 
                isVerified: true, 
                isPasswordValid: jest.fn().mockResolvedValue(true) 
            };
            User.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });
            generateToken
                .mockReturnValueOnce('accessToken')
                .mockReturnValueOnce('refreshToken');

            const credentials = { email: 'test@example.com', password: 'password' };
            const result = await authService.loginUser(credentials);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(mockUser.isPasswordValid).toHaveBeenCalledWith('password');
            expect(result).toEqual({ success: true, token: 'accessToken', refreshToken: 'refreshToken' });
        });

        it('should throw error if user is not found', async () => {
            User.findOne = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            const credentials = { email: 'test@example.com', password: 'password' };

            await expect(authService.loginUser(credentials)).rejects.toThrow('Invalid email or password');
            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        });

        it('should throw error if password is invalid', async () => {
            const mockUser = { 
                _id: 'userId', 
                email: 'test@example.com', 
                isVerified: true, 
                isPasswordValid: jest.fn().mockResolvedValue(false) 
            };
            User.findOne = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });

            const credentials = { email: 'test@example.com', password: 'wrongpassword' };

            await expect(authService.loginUser(credentials)).rejects.toThrow('Invalid email or password');
            expect(mockUser.isPasswordValid).toHaveBeenCalledWith('wrongpassword');
        });

        it('should throw error if email is not verified', async () => {
            const mockUser = { 
                _id: 'userId', 
                email: 'test@example.com', 
                isVerified: false, 
                isPasswordValid: jest.fn().mockResolvedValue(true) 
            };
            User.findOne = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });

            const credentials = { email: 'test@example.com', password: 'password' };

            await expect(authService.loginUser(credentials)).rejects.toThrow('Please verify your email before logging in');
            expect(mockUser.isPasswordValid).toHaveBeenCalledWith('password');
        });
    });

    describe('requestPasswordReset', () => {
        it('should send password reset email for existing user', async () => {
            const mockUser = { id: 'userId', name: 'Test User', email: 'test@example.com' };
            User.findByEmail.mockResolvedValue(mockUser);
            generateToken.mockReturnValue('resetToken');
            createPasswordResetTemplate.mockReturnValue('resetEmailContent');
            sendEmail.mockResolvedValue();
            process.env.BASE_URL = 'http://localhost:5000';

            await authService.requestPasswordReset('test@example.com');

            expect(User.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(generateToken).toHaveBeenCalledWith({ userId: 'userId' }, TOKEN_TYPES.RESET);
            expect(createPasswordResetTemplate).toHaveBeenCalledWith(
                'Test User', 
                'http://localhost:5000/api/auth/reset-password?token=resetToken'
            );
            expect(sendEmail).toHaveBeenCalledWith('test@example.com', 'Password Reset Request', 'resetEmailContent');
        });

        it('should silently fail if user does not exist', async () => {
            User.findByEmail.mockResolvedValue(null);

            await authService.requestPasswordReset('nonexistent@example.com');

            expect(User.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
            expect(sendEmail).not.toHaveBeenCalled();
        });

        it('should throw error if sending email fails', async () => {
            const mockUser = { id: 'userId', name: 'Test User', email: 'test@example.com' };
            User.findByEmail.mockResolvedValue(mockUser);
            generateToken.mockReturnValue('resetToken');
            createPasswordResetTemplate.mockReturnValue('resetEmailContent');
            sendEmail.mockRejectedValue(new Error('Email service down'));

            await expect(authService.requestPasswordReset('test@example.com')).rejects.toThrow('Error sending password reset email');
            expect(sendEmail).toHaveBeenCalled();
        });
    });

    describe('resetPassword', () => {
        it('should reset password successfully with valid token', async () => {
            verifyToken.mockReturnValue({ userId: 'userId' });
            const mockUser = { _id: 'userId', save: jest.fn() };
            User.findById.mockResolvedValue(mockUser);

            await authService.resetPassword('validToken', 'newPassword');

            expect(verifyToken).toHaveBeenCalledWith('validToken', TOKEN_TYPES.RESET);
            expect(User.findById).toHaveBeenCalledWith('userId');
            expect(mockUser.password).toBe('newPassword');
            expect(mockUser.save).toHaveBeenCalled();
        });

        it('should throw error if token is missing', async () => {
            await expect(authService.resetPassword(null, 'newPassword')).rejects.toThrow('Token is missing');
            expect(verifyToken).not.toHaveBeenCalled();
        });

        it('should throw error if token is invalid', async () => {
            verifyToken.mockImplementation(() => { throw new Error('Invalid token'); });

            await expect(authService.resetPassword('invalidToken', 'newPassword')).rejects.toThrow('Invalid token');
            expect(verifyToken).toHaveBeenCalledWith('invalidToken', TOKEN_TYPES.RESET);
            expect(User.findById).not.toHaveBeenCalled();
        });

        it('should throw error if user is not found', async () => {
            verifyToken.mockReturnValue({ userId: 'userId' });
            User.findById.mockResolvedValue(null);

            await expect(authService.resetPassword('validToken', 'newPassword')).rejects.toThrow('User not found');
            expect(User.findById).toHaveBeenCalledWith('userId');
        });
    });

    describe('verifyEmail', () => {
        it('should verify email successfully with valid token', async () => {
            verifyToken.mockReturnValue({ userId: 'userId' });
            const mockUser = { _id: 'userId', isVerified: false, save: jest.fn() };
            User.findById.mockResolvedValue(mockUser);

            await authService.verifyEmail('validToken');

            expect(verifyToken).toHaveBeenCalledWith('validToken', TOKEN_TYPES.VERIFY);
            expect(User.findById).toHaveBeenCalledWith('userId');
            expect(mockUser.isVerified).toBe(true);
            expect(mockUser.save).toHaveBeenCalled();
        });

        it('should throw error if token is invalid', async () => {
            verifyToken.mockImplementation(() => { throw new Error('Invalid token'); });

            await expect(authService.verifyEmail('invalidToken')).rejects.toThrow('Invalid token');
            expect(verifyToken).toHaveBeenCalledWith('invalidToken', TOKEN_TYPES.VERIFY);
            expect(User.findById).not.toHaveBeenCalled();
        });

        it('should throw error if user is not found', async () => {
            verifyToken.mockReturnValue({ userId: 'userId' });
            User.findById.mockResolvedValue(null);

            await expect(authService.verifyEmail('validToken')).rejects.toThrow('User not found');
            expect(User.findById).toHaveBeenCalledWith('userId');
        });

        it('should throw error if email is already verified', async () => {
            verifyToken.mockReturnValue({ userId: 'userId' });
            const mockUser = { _id: 'userId', isVerified: true };
            User.findById.mockResolvedValue(mockUser);

            await expect(authService.verifyEmail('validToken')).rejects.toThrow('Email already verified');
            expect(mockUser.isVerified).toBe(true);
        });
    });

    describe('validateResetToken', () => {
        it('should validate reset token successfully', () => {
            verifyToken.mockReturnValue({ userId: 'userId' });

            const result = authService.validateResetToken('validToken');

            expect(verifyToken).toHaveBeenCalledWith('validToken', TOKEN_TYPES.RESET);
            expect(result).toEqual({ userId: 'userId' });
        });

        it('should throw error if token is missing', () => {
            expect(() => authService.validateResetToken(null)).toThrow('Token is missing');
            expect(verifyToken).not.toHaveBeenCalled();
        });

        it('should throw error if token is invalid', () => {
            verifyToken.mockImplementation(() => { throw new Error('Invalid token'); });

            expect(() => authService.validateResetToken('invalidToken')).toThrow('Invalid token');
            expect(verifyToken).toHaveBeenCalledWith('invalidToken', TOKEN_TYPES.RESET);
        });
    });

    describe('requestEmailVerificationOtp', () => {
        it('should send email verification OTP successfully', async () => {
            const mockUser = { id: 'userId', email: 'test@example.com' };
            User.findByEmail.mockResolvedValue(mockUser);
            generateOtp.mockReturnValue('123456');
            saveOtp.mockResolvedValue();
            sendEmail.mockResolvedValue();

            await authService.requestEmailVerificationOtp('test@example.com');

            expect(User.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(generateOtp).toHaveBeenCalled();
            expect(saveOtp).toHaveBeenCalledWith('userId', '123456');
            expect(sendEmail).toHaveBeenCalledWith('test@example.com', 'Your OTP Code', '<p>Your OTP code is 123456</p>');
        });

        it('should throw error if user is not found', async () => {
            User.findByEmail.mockResolvedValue(null);

            await expect(authService.requestEmailVerificationOtp('nonexistent@example.com')).rejects.toThrow('User not found');
            expect(User.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
            expect(generateOtp).not.toHaveBeenCalled();
            expect(sendEmail).not.toHaveBeenCalled();
        });
    });

    describe('requestPhoneVerificationOtp', () => {
        it('should send phone verification OTP successfully', async () => {
            const mockUser = { phoneNumber: '1234567890' };
            User.findOne.mockResolvedValue(mockUser);
            generateOtp.mockReturnValue('654321');
            saveOtp.mockResolvedValue();
            sendSms.mockResolvedValue();

            await authService.requestPhoneVerificationOtp('1234567890');

            expect(User.findOne).toHaveBeenCalledWith({ phoneNumber: '1234567890' });
            expect(generateOtp).toHaveBeenCalled();
            expect(saveOtp).toHaveBeenCalledWith(mockUser.id, '654321');
            expect(sendSms).toHaveBeenCalledWith('1234567890', 'Your OTP code is 654321');
        });

        it('should throw error if user is not found', async () => {
            User.findOne.mockResolvedValue(null);

            await expect(authService.requestPhoneVerificationOtp('0987654321')).rejects.toThrow('User not found');
            expect(User.findOne).toHaveBeenCalledWith({ phoneNumber: '0987654321' });
            expect(generateOtp).not.toHaveBeenCalled();
            expect(sendSms).not.toHaveBeenCalled();
        });
    });

    describe('verifyEmailOtp', () => {
        it('should verify email OTP successfully', async () => {
            const mockUser = { id: 'userId', isVerified: false, save: jest.fn() };
            User.findByEmail.mockResolvedValue(mockUser);
            verifyOtp.mockResolvedValue();

            await authService.verifyEmailOtp('test@example.com', '123456');

            expect(User.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(verifyOtp).toHaveBeenCalledWith('userId', '123456');
            expect(mockUser.isVerified).toBe(true);
            expect(mockUser.save).toHaveBeenCalled();
        });

        it('should throw error if user is not found', async () => {
            User.findByEmail.mockResolvedValue(null);

            await expect(authService.verifyEmailOtp('nonexistent@example.com', '123456')).rejects.toThrow('User not found');
            expect(User.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
            expect(verifyOtp).not.toHaveBeenCalled();
        });
    });

    describe('verifyPhoneOtp', () => {
        it('should verify phone OTP successfully', async () => {
            const mockUser = { id: 'userId', phoneNumber: '1234567890', isVerified: false, save: jest.fn() };
            User.findOne.mockResolvedValue(mockUser);
            verifyOtp.mockResolvedValue(true);

            await authService.verifyPhoneOtp('1234567890', '654321');

            expect(User.findOne).toHaveBeenCalledWith({ phoneNumber: '1234567890' });
            expect(verifyOtp).toHaveBeenCalledWith(mockUser.id, '654321');
            expect(mockUser.isVerified).toBe(true);
            expect(mockUser.save).toHaveBeenCalled();
        });

        it('should throw error if user is not found', async () => {
            User.findOne.mockResolvedValue(null);

            await expect(authService.verifyPhoneOtp('0987654321', '654321')).rejects.toThrow('User not found');
            expect(User.findOne).toHaveBeenCalledWith({ phoneNumber: '0987654321' });
            expect(verifyOtp).not.toHaveBeenCalled(); // Changed: should not call verifyOtp
        });
    });

    describe('cleanUpOtps', () => {
        it('should clean up expired OTPs', async () => {
            cleanUpExpiredOtps.mockResolvedValue();

            await authService.cleanUpOtps();

            expect(cleanUpExpiredOtps).toHaveBeenCalled();
        });
    });
});