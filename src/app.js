import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import { swaggerSpec, swaggerUi } from './config/swagger.js';
import errorHandler from './middlewares/errorHandler.js';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
connectDB();

const app = express();

app.use(cors({
    origin: 'http://localhost:5000',
    credentials: true
}));

app.get('/swagger.json', (req, res) => {
    res.json(swaggerSpec);
});

app.use(express.json());
app.use(errorHandler);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Swagger setup
app.use('/api/auth', authRoutes);

console.log('App initialized and routes set up');

export default app;
