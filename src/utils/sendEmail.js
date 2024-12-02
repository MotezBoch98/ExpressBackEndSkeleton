import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

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
        console.log(`Sending email to: ${to}, subject: ${subject}`);
        await sgMail.send(msg);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error.response?.body?.errors || error.message);
        throw new Error('Failed to send email');
    }
};


