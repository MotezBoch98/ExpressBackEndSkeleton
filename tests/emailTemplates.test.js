import { createVerificationEmailTemplate, createPasswordResetTemplate } from '../src/utils/emailTemplates.js';

describe('Email Templates', () => {
    it('should create a verification email template', () => {
        const name = 'John Doe';
        const url = 'http://example.com/verify';
        const template = createVerificationEmailTemplate(name, url);

        expect(template).toContain(name);
        expect(template).toContain(url);
        expect(template).toContain('Welcome to Our Platform!');
        expect(template).toContain('Verify Your Email');
        expect(template).toContain('Please verify your email address by clicking the button below:');
        expect(template).toContain('If the button doesn\'t work, you can also copy and paste this link into your browser:');
        expect(template).toContain('This verification link will expire in 24 hours.');
        expect(template).toContain('Best regards,<br>Your App Team');
    });

    it('should create a password reset email template', () => {
        const name = 'John Doe';
        const url = 'http://example.com/reset';
        const template = createPasswordResetTemplate(name, url);

        expect(template).toContain(name);
        expect(template).toContain(url);
        expect(template).toContain('Password Reset Request');
        expect(template).toContain('We received a request to reset your password. Click the button below to create a new password:');
        expect(template).toContain('If the button doesn\'t work, you can also copy and paste this link into your browser:');
        expect(template).toContain('This reset link will expire in 1 hour.');
        expect(template).toContain('Best regards,<br>Your App Team');
    });
});