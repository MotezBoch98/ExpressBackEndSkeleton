import * as authService from '../src/services/auth.service.js';
import * as authController from '../src/controllers/auth.controller.js';

jest.mock('../src/services/auth.service.js');
jest.mock('../src/config/logger.js');

describe('Auth Controller', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, query: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            req.body = { name: 'Test User', email: 'test@example.com', password: 'password', phoneNumber: '1234567890' };
            authService.registerUser.mockResolvedValue({ _id: 'userId', email: 'test@example.com' });

            await authController.register(req, res);

            expect(authService.registerUser).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: { _id: 'userId', email: 'test@example.com' } });
        });

        it('should handle registration errors', async () => {
            req.body = { name: 'Test User', email: 'test@example.com', password: 'password', phoneNumber: '1234567890' };
            authService.registerUser.mockRejectedValue(new Error('Registration failed'));

            await authController.register(req, res);

            expect(authService.registerUser).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Registration failed' });
        });
    });

    describe('login', () => {
        it('should login user successfully', async () => {
            req.body = { email: 'test@example.com', password: 'password' };
            authService.loginUser.mockResolvedValue({ success: true, token: 'accessToken', refreshToken: 'refreshToken' });

            await authController.login(req, res);

            expect(authService.loginUser).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, token: 'accessToken' });
        });

        it('should handle failed login', async () => {
            req.body = { email: 'test@example.com', password: 'wrongpassword' };
            authService.loginUser.mockResolvedValue({ success: false, message: 'Invalid credentials' });

            await authController.login(req, res);

            expect(authService.loginUser).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid credentials' });
        });

        it('should handle login errors', async () => {
            req.body = { email: 'test@example.com', password: 'password' };
            authService.loginUser.mockRejectedValue(new Error('Login failed'));

            await authController.login(req, res);

            expect(authService.loginUser).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Login failed' });
        });
    });

    describe('verifyEmail', () => {
        it('should verify email successfully', async () => {
            req.query = { token: 'validToken' };
            authService.verifyEmail.mockResolvedValue();

            await authController.verifyEmail(req, res);

            expect(authService.verifyEmail).toHaveBeenCalledWith('validToken');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Email verified successfully' });
        });

        it('should handle email verification errors', async () => {
            req.query = { token: 'invalidToken' };
            authService.verifyEmail.mockRejectedValue(new Error('Invalid token'));

            await authController.verifyEmail(req, res);

            expect(authService.verifyEmail).toHaveBeenCalledWith('invalidToken');
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid token' });
        });
    });

    describe('requestPasswordReset', () => {
        it('should request password reset successfully', async () => {
            req.body = { email: 'test@example.com' };
            authService.requestPasswordReset.mockResolvedValue();

            await authController.requestPasswordReset(req, res);

            expect(authService.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Password reset email sent' });
        });

        it('should handle password reset request errors', async () => {
            req.body = { email: 'test@example.com' };
            authService.requestPasswordReset.mockRejectedValue(new Error('Reset failed'));

            await authController.requestPasswordReset(req, res);

            expect(authService.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Reset failed' });
        });
    });

    describe('showResetPasswordForm', () => {
        it('should display reset password form successfully', async () => {
            req.query = { token: 'validToken' };
            authService.validateResetToken.mockReturnValue({ userId: 'userId' });

            await authController.showResetPasswordForm(req, res);

            expect(authService.validateResetToken).toHaveBeenCalledWith('validToken');
            expect(res.send).toHaveBeenCalledWith(expect.stringContaining('<h2>Reset Your Password</h2>'));
        });

        it('should handle token validation errors', async () => {
            req.query = { token: 'invalidToken' };
            authService.validateResetToken.mockImplementation(() => { throw new Error('Invalid token'); });

            await authController.showResetPasswordForm(req, res);

            expect(authService.validateResetToken).toHaveBeenCalledWith('invalidToken');
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith(expect.stringContaining('<p>Invalid token</p>'));
        });
    });

    describe('resetPassword', () => {
        it('should reset password successfully', async () => {
            req.body = { token: 'validToken', newPassword: 'newPass', confirmPassword: 'newPass' };
            authService.resetPassword.mockResolvedValue();

            await authController.resetPassword(req, res);

            expect(authService.resetPassword).toHaveBeenCalledWith('validToken', 'newPass');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Password updated successfully' });
        });

        it('should handle missing token', async () => {
            req.body = { newPassword: 'newPass', confirmPassword: 'newPass' };

            await authController.resetPassword(req, res);

            expect(authService.resetPassword).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Token is missing' });
        });

        it('should handle password mismatch', async () => {
            req.body = { token: 'validToken', newPassword: 'newPass', confirmPassword: 'differentPass' };

            await authController.resetPassword(req, res);

            expect(authService.resetPassword).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Passwords do not match' });
        });

        it('should handle reset password errors', async () => {
            req.body = { token: 'validToken', newPassword: 'newPass', confirmPassword: 'newPass' };
            authService.resetPassword.mockRejectedValue(new Error('Reset failed'));

            await authController.resetPassword(req, res);

            expect(authService.resetPassword).toHaveBeenCalledWith('validToken', 'newPass');
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Reset failed' });
        });
    });

    describe('requestEmailVerificationOtp', () => {
        it('should send email verification OTP successfully', async () => {
            req.body = { email: 'test@example.com' };
            authService.requestEmailVerificationOtp.mockResolvedValue();

            await authController.requestEmailVerificationOtp(req, res);

            expect(authService.requestEmailVerificationOtp).toHaveBeenCalledWith('test@example.com');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: 'OTP sent to email' });
        });

        it('should handle OTP request errors', async () => {
            req.body = { email: 'test@example.com' };
            authService.requestEmailVerificationOtp.mockRejectedValue(new Error('OTP service down'));

            await authController.requestEmailVerificationOtp(req, res);

            expect(authService.requestEmailVerificationOtp).toHaveBeenCalledWith('test@example.com');
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'OTP service down' });
        });
    });

    describe('verifyEmailOtp', () => {
        it('should verify email OTP successfully', async () => {
            req.body = { email: 'test@example.com', otp: '123456' };
            authService.verifyEmailOtp.mockResolvedValue();

            await authController.verifyEmailOtp(req, res);

            expect(authService.verifyEmailOtp).toHaveBeenCalledWith('test@example.com', '123456');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Email verified successfully' });
        });

        it('should handle OTP verification errors', async () => {
            req.body = { email: 'test@example.com', otp: 'invalidOtp' };
            authService.verifyEmailOtp.mockRejectedValue(new Error('Invalid OTP'));

            await authController.verifyEmailOtp(req, res);

            expect(authService.verifyEmailOtp).toHaveBeenCalledWith('test@example.com', 'invalidOtp');
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid OTP' });
        });
    });

    describe('requestPhoneVerificationOtp', () => {
        it('should send phone verification OTP successfully', async () => {
            req.body = { phoneNumber: '1234567890' };
            authService.requestPhoneVerificationOtp.mockResolvedValue();

            await authController.requestPhoneVerificationOtp(req, res);

            expect(authService.requestPhoneVerificationOtp).toHaveBeenCalledWith('1234567890');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: 'OTP sent to phone' });
        });

        it('should handle OTP request errors', async () => {
            req.body = { phoneNumber: '1234567890' };
            authService.requestPhoneVerificationOtp.mockRejectedValue(new Error('OTP service down'));

            await authController.requestPhoneVerificationOtp(req, res);

            expect(authService.requestPhoneVerificationOtp).toHaveBeenCalledWith('1234567890');
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'OTP service down' });
        });
    });

    describe('verifyPhoneOtp', () => {
        it('should verify phone OTP successfully', async () => {
            req.body = { phoneNumber: '1234567890', otp: '654321' };
            authService.verifyPhoneOtp.mockResolvedValue();

            await authController.verifyPhoneOtp(req, res);

            expect(authService.verifyPhoneOtp).toHaveBeenCalledWith('1234567890', '654321');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Phone number verified successfully' });
        });

        it('should handle OTP verification errors', async () => {
            req.body = { phoneNumber: '1234567890', otp: 'invalidOtp' };
            authService.verifyPhoneOtp.mockRejectedValue(new Error('Invalid OTP'));

            await authController.verifyPhoneOtp(req, res);

            expect(authService.verifyPhoneOtp).toHaveBeenCalledWith('1234567890', 'invalidOtp');
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid OTP' });
        });
    });
});