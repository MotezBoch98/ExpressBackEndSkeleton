import Mailgun from 'mailgun.js';
import formData from 'form-data';
import dotenv from 'dotenv';
import logger from '../config/logger.js';

dotenv.config();

// Mailgun configuration
const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY });

/**
 * Sends an email using Mailgun.
 * 
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} htmlContent - The HTML content of the email.
 * @returns {Promise<void>}
 * @throws {Error} If there is an error sending the email.
 */
export const sendEmail = async (to, subject, htmlContent) => {
    const msg = {
        from: process.env.EMAIL_FROM, // Ensure this email is verified with Mailgun
        to: [to], // Mailgun accepts arrays for multiple recipients
        subject,
        html: htmlContent,
    };

    try {
        logger.info(`Sending email to: ${to}, subject: ${subject}`);
        const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, msg);
        logger.info(`Email sent successfully: ${JSON.stringify(response)}`);
    } catch (error) {
        logger.error(`Error sending email: ${error.response?.message || error.message}`);
        throw new Error('Failed to send email');
    }
};
