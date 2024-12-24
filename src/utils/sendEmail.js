import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import logger from '../config/logger.js';

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async (to, subject, htmlContent) => {
    const msg = {
        to,
        from: process.env.EMAIL_FROM, // Ensure this email is verified with SendGrid
        subject,
        html: htmlContent,
    };

    try {
        logger.info(`Sending email to: ${to}, subject: ${subject}`);
        await sgMail.send(msg);
        logger.info('Email sent successfully');
    } catch (error) {
        logger.error(`Error sending email: ${error.response?.body?.errors || error.message}`);
        throw new Error('Failed to send email');
    }
};
