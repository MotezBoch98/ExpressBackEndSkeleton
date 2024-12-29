import { sendEmail } from '../src/utils/sendEmail.js';
import sgMail from '@sendgrid/mail';

jest.mock('@sendgrid/mail');

describe('Send Email', () => {
    it('should send an email', async () => {
        sgMail.send.mockResolvedValue([{ statusCode: 202 }]);
        
        await sendEmail('test@example.com', 'Test Subject', '<p>Test Content</p>');
        
        expect(sgMail.send).toHaveBeenCalled();
        expect(sgMail.send).toHaveBeenCalledWith({
            to: 'test@example.com',
            from: expect.any(String), // Assuming the 'from' address is set in the sendEmail function
            subject: 'Test Subject',
            html: '<p>Test Content</p>',
        });
    });

    it('should handle email sending errors', async () => {
        sgMail.send.mockRejectedValue(new Error('Failed to send email'));
        
        await expect(sendEmail('test@example.com', 'Test Subject', '<p>Test Content</p>'))
            .rejects
            .toThrow('Failed to send email');
        
        expect(sgMail.send).toHaveBeenCalled();
    });
});