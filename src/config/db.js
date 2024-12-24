import mongoose from 'mongoose';
import logger from './logger.js';

/**
 * Connects to the MongoDB database.
 * 
 * @returns {Promise<void>}
 * @throws {Error} If there is an error during the database connection.
 */
const connectDB = async () => {
    try {
        logger.info('Connecting to database...');
        await mongoose.connect(process.env.DB_URI);
        logger.info('Database connected');
    } catch (error) {
        logger.error('Database connection failed:', { message: error.message });
        process.exit(1);
    }
};

export default connectDB;