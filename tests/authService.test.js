import { registerUser, loginUser } from '../src/services/authService.js';
import User from '../src/models/User.js';

jest.mock('../src/models/User.js'); // Mock the User model

describe('Auth Service Tests', () => {
    it('should register a user successfully', async () => {
        User.findOne.mockResolvedValue(null); // Simulate no existing user
        User.prototype.save = jest.fn().mockResolvedValue({
            id: '12345',
            name: 'Test User',
            email: 'test@example.com',
        });

        const user = await registerUser({
            name: 'Test User',
            email: 'test@example.com',
            password: 'Password123',
        });

        expect(user).toHaveProperty('id');
        expect(user.email).toBe('test@example.com');
    });

    it('should throw an error if the email is already registered', async () => {
        User.findOne.mockResolvedValue({ email: 'test@example.com' });

        await expect(
            registerUser({
                name: 'Test User',
                email: 'test@example.com',
                password: 'Password123',
            })
        ).rejects.toThrow('Email already in use');
    });
});
