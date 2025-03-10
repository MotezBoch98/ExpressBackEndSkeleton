import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import profileRoutes from './routes/profile.routes.js';
import productRoutes from './routes/product.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { swaggerSpec, swaggerUi } from './config/swagger.js';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import logger from './config/logger.js';
import session from 'express-session';
import passport from './config/passport.js';


dotenv.config();
connectDB();

const app = express();

/**
 * Middleware to enable CORS.
 */
app.use(cors({
    origin: '*', // Allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow specific methods
    allowedHeaders: 'Content-Type,Authorization', // Allow specific headers
    credentials: true
}));

// Session configuration (must come before passport)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true, // Changed for better session handling
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'Lax', // Changed from 'strict'
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Initialize Passport (order is crucial!)
app.use(passport.initialize());
app.use(passport.session());

/**
 * Middleware to log incoming requests.
 */
app.use((req, res, next) => {
    const { method, url, headers, body } = req;
    logger.info(`Incoming Request: ${method} ${url} - Body: ${JSON.stringify(body)}`);
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
app.use('/api/profile', profileRoutes);

/**
 * Route to handle profile-related requests.
 */
app.use('/api/product-management', productRoutes);

// Handle 404 errors
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

console.log('App initialized and routes set up');

export default app;