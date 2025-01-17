import twilio from 'twilio';
import dotenv from 'dotenv';
import logger from '../config/logger.js';

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Sends an SMS using Twilio.
 * 
 * @param {string} to - The recipient's phone number.
 * @param {string} message - The message to send.
 * @returns {Promise<void>}
 * @throws {Error} If there is an error sending the SMS.
 */
export const sendSms = async (to, message) => {
    try {
        logger.info(`Sending SMS to: ${to}, message: ${message}`);
        const response = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to,
        });
        logger.info(`SMS sent successfully: ${response.sid}`);
    } catch (error) {
        logger.error(`Error sending SMS: ${error.message}`);
        throw new Error('Failed to send SMS');
    }
};