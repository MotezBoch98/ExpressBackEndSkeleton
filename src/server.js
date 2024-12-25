import app from './app.js';
import logger from './config/logger.js';

const PORT = process.env.PORT || 5000;

/**
 * Starts the server and listens on the specified port.
 */
app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});