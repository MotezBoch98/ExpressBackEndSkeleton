import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.DB_URI);
        console.log('Database connected');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
};

export default connectDB;
