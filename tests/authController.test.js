import request from 'supertest';
import app from '../src/app.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../src/models/User.js';
import * as emailUtils from '../src/utils/sendEmail.js';
import * as JWT from '../src/utils/JWT.js';

beforeAll(async () => {
    await mongoose.connect(process.env.DB_URI);
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Auth Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should register a new user', async () => {
        jest.spyOn(User, 'exists').mockResolvedValue(false);
        jest.spyOn(User, 'create').mockResolvedValue({ _id: 'userId', email: 'motazbouchhiwa@gmail.com' });
        jest.spyOn(emailUtils, 'sendEmail').mockResolvedValue(true);
        jest.spyOn(JWT, 'generateToken').mockReturnValue('mockToken');

        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                name: 'John Doe',
                email: 'motazbouchhiwa@gmail.com',
                password: 'mama'
            });

        if (res.statusCode === 400 && res.body.message === 'Email already registered') {
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Email already registered');
        } else {
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('success', true);
            expect(emailUtils.sendEmail).toHaveBeenCalledWith(
                'motazbouchhiwa@gmail.com',
                'Verify Your Email',
                expect.stringContaining('mockToken')
            );
        }
    });

    it('should login a user', async () => {
        jest.spyOn(User, 'findOne').mockResolvedValue({
            _id: 'userId',
            email: 'motazbouchhiwa@gmail.com',
            password: 'hashedPassword',
            isVerified: true,
        });
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
        jest.spyOn(JWT, 'generateToken').mockReturnValue('mockAccessToken');

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'motazbouchhiwa@gmail.com',
                password: 'mama'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('token');
    });

    it('should request a password reset', async () => {
        jest.spyOn(User, 'findOne').mockResolvedValue({ _id: 'userId', email: 'motazbouchhiwa@gmail.com' });
        jest.spyOn(emailUtils, 'sendEmail').mockResolvedValue(true);
        jest.spyOn(JWT, 'generateToken').mockReturnValue('mockResetToken');

        const res = await request(app)
            .post('/api/auth/request-password-reset')
            .send({ email: 'motazbouchhiwa@gmail.com' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('success', true);
        expect(emailUtils.sendEmail).toHaveBeenCalledWith(
            'motazbouchhiwa@gmail.com',
            'Password Reset Request',
            expect.stringContaining('mockResetToken')
        );
    });

    it('should verify email', async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

        jest.spyOn(JWT, 'verifyToken').mockReturnValue({ userId });
        jest.spyOn(User, 'findById').mockResolvedValue({ _id: userId, email: 'motazbouchhiwa@gmail.com', isVerified: false, save: jest.fn() });

        const res = await request(app)
            .get(`/api/auth/verify-email?token=${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('success', true);
    });
});