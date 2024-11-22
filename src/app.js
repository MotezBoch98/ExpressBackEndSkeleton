import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import express from 'express';
import dotenv from 'dotenv';
import { swaggerSpec, swaggerUi } from './config/swagger.js'; // Import Swagger configuration

dotenv.config();
connectDB();

const app = express();

app.get('/swagger.json', (req, res) => {
    res.json(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Swagger setup
app.use(express.json());
app.use('/api/auth', authRoutes);

export default app;
