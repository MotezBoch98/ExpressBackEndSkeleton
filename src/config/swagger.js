import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

/**
 * Swagger definition for your API documentation.
 */
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Auth API',
        version: '1.0.0',
        description: 'API documentation for user authentication, password reset, and OTP features.',
    },
    servers: [
        {
            url: 'http://localhost:5000', // Change to your server's URL
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ['./src/routes/*.js'], // Path to your API routes
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerSpec, swaggerUi };
