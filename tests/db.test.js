import mongoose from 'mongoose';
import connectDB from '../src/config/db';
import logger from '../src/config/logger';

jest.mock('mongoose');
jest.mock('../src/config/logger');

describe('Database Connection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should connect to the database successfully', async () => {
        mongoose.connect.mockResolvedValueOnce({});
        await connectDB();
        expect(logger.info).toHaveBeenCalledWith('Connecting to database...');
        expect(logger.info).toHaveBeenCalledWith('Database connected');
        expect(mongoose.connect).toHaveBeenCalledWith(process.env.DB_URI);
    });

    it('should log an error and exit process if connection fails', async () => {
        const errorMessage = 'Connection failed';
        mongoose.connect.mockRejectedValueOnce(new Error(errorMessage));
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

        await connectDB();

        expect(logger.info).toHaveBeenCalledWith('Connecting to database...');
        expect(logger.error).toHaveBeenCalledWith('Database connection failed:', { message: errorMessage });
        expect(exitSpy).toHaveBeenCalledWith(1);

        exitSpy.mockRestore();
    });
});