import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import logger from '../config/logger.js';

dotenv.config();

/**
 * Creates the Nodemailer transporter with Gmail configuration.
 */
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD, // App Password
    },
});

/**
 * Sends an email using Nodemailer and Gmail.
 * 
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} htmlContent - The HTML content of the email.
 * @returns {Promise<void>}
 * @throws {Error} If there is an error sending the email.
 */
export const sendEmail = async (to, subject, htmlContent) => {
    const msg = {
        from: `${process.env.GMAIL_USER}`, // Sender email
        to, // Recipient email
        subject, // Subject
        html: htmlContent, // HTML content
    };

    try {
        logger.info(`Sending email to: ${to}, subject: ${subject}`);
        const response = await transporter.sendMail(msg);

        logger.info(`Email sent successfully: ${response.messageId}`);
    } catch (error) {
        logger.error(`Error sending email: ${error.message}`);
        throw new Error('Failed to send email');
    }
};
