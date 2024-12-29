import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';

describe('Database Connection', () => {
    let originalExit;

    beforeAll(() => {
        originalExit = process.exit;
        process.exit = jest.fn();
    });

    afterAll(async () => {
        await mongoose.connection.close();
        process.exit = originalExit;
    });

    it('should connect to the database', async () => {
        try {
            await connectDB();
            expect(mongoose.connection.readyState).toBe(1); // 1 means connected
        } catch (error) {
            console.error('Database connection failed:', error.message);
            expect(error).toBeNull(); // Fail the test if there is an error
        }
    });
});