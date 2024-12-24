import request from 'supertest';
import app from '../src/app.js';
import mongoose from 'mongoose';

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
});

describe('Auth Endpoints', () => {
    it('should register a new user successfully', async () => {
        const res = await request(app).post('/api/auth/register').send({
            name: 'Test User',
            email: 'test@example.com',
            password: 'Password123',
        });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('email', 'test@example.com');
    });

    it('should not register with an existing email', async () => {
        await request(app).post('/api/auth/register').send({
            name: 'Test User',
            email: 'duplicate@example.com',
            password: 'Password123',
        });

        const res = await request(app).post('/api/auth/register').send({
            name: 'Another User',
            email: 'duplicate@example.com',
            password: 'Password456',
        });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Email already in use');
    });
});
