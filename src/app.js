import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import profileRoutes from './routes/profile.routes.js';
import { swaggerSpec, swaggerUi } from './config/swagger.js';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import logger from './config/logger.js';

dotenv.config();
connectDB();

const app = express();

/**
 * Middleware to enable CORS.
 */
app.use(cors({
    origin: 'http://localhost:5000',
    credentials: true
}));

/**
 * Middleware to log incoming requests.
 */
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

/**
 * Route to serve Swagger JSON specification.
 */
app.get('/swagger.json', (req, res) => {
    res.json(swaggerSpec);
});

/**
 * Middleware to parse JSON and URL-encoded data.
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Route to serve Swagger UI documentation.
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Swagger setup

/**
 * Route to handle authentication-related requests.
 */
app.use('/api/auth', authRoutes);

/**
 * Route to handle user-related requests.
 */
app.use('/api/user-management', userRoutes);

/**
 * Route to handle profile-related requests.
 */
app.use('/api/profile-management', profileRoutes);

console.log('App initialized and routes set up');

export default app;