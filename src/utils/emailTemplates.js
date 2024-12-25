/**
 * Creates an email template for email verification.
 * 
 * @param {string} userName - The name of the user.
 * @param {string} verificationLink - The link to verify the user's email.
 * @returns {string} The email template as an HTML string.
 */
export const createVerificationEmailTemplate = (userName, verificationLink) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Welcome to Our Platform!</h2>
            <p>Hello ${userName},</p>
            <p>Thank you for registering with us. Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" 
                   style="background-color: #4CAF50; color: white; padding: 12px 25px; 
                          text-decoration: none; border-radius: 4px; display: inline-block;">
                    Verify Email Address
                </a>
            </div>
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">
                ${verificationLink}
            </p>
            <p>This verification link will expire in 24 hours.</p>
            <p>Best regards,<br>Your App Team</p>
        </div>
    `;
};

/**
 * Creates an email template for password reset.
 * 
 * @param {string} userName - The name of the user.
 * @param {string} resetLink - The link to reset the user's password.
 * @returns {string} The email template as an HTML string.
 */
export const createPasswordResetTemplate = (userName, resetLink) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hello ${userName},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="background-color: #4CAF50; color: white; padding: 12px 25px; 
                          text-decoration: none; border-radius: 4px; display: inline-block;">
                    Reset Password
                </a>
            </div>
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">
                ${resetLink}
            </p>
            <p>This reset link will expire in 1 hour. If you didn't request this password reset, please ignore this email.</p>
            <p>Best regards,<br>Your App Team</p>
        </div>
    `;
};