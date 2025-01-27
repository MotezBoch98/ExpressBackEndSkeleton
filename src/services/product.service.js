import Product from '../models/Product.js';
import AppError from '../utils/AppError.js';
import logger from '../config/logger.js';

/**
 * Creates a new product
 * @param {Object} productData - Product data
 * @returns {Promise<Product>}
 */
export const createProduct = async (productData) => {
    logger.info('Creating new product');
    try {
        const product = await Product.create(productData);
        return product;
    } catch (error) {
        logger.error('Product creation failed', { error: error.message });
        throw new AppError(error.message, 400);
    }
};

/**
 * Retrieves products with optional filtering
 * @param {Object} query - Query parameters
 * @returns {Promise<Array<Product>>}
 */
export const getProducts = async (query = {}) => {
    logger.info('Fetching products');
    try {
        const products = await Product.find(query);
        return products;
    } catch (error) {
        logger.error('Product fetch failed', { error: error.message });
        throw new AppError('Failed to fetch products', 500);
    }
};

/**
 * Retrieves a single product by ID
 * @param {string} id - Product ID
 * @returns {Promise<Product>}
 */
export const getProductById = async (id) => {
    logger.info(`Fetching product with id: ${id}`);
    try {
        const product = await Product.findById(id);
        if (!product) {
            throw new AppError('Product not found', 404);
        }
        return product;
    } catch (error) {
        logger.error('Product fetch failed', { error: error.message });
        throw new AppError(error.message, error.statusCode || 500);
    }
};

/**
 * Updates a product
 * @param {string} id - Product ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Product>}
 */
export const updateProduct = async (id, updateData) => {
    logger.info(`Updating product with id: ${id}`);
    try {
        const product = await Product.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });
        if (!product) {
            throw new AppError('Product not found', 404);
        }
        return product;
    } catch (error) {
        logger.error('Product update failed', { error: error.message });
        throw new AppError(error.message, error.statusCode || 500);
    }
};

/**
 * Deletes a product
 * @param {string} id - Product ID
 * @returns {Promise<void>}
 */
export const deleteProduct = async (id) => {
    logger.info(`Deleting product with id: ${id}`);
    try {
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            throw new AppError('Product not found', 404);
        }
    } catch (error) {
        logger.error('Product deletion failed', { error: error.message });
        throw new AppError(error.message, error.statusCode || 500);
    }
};

/**
 * Updates product stock
 * @param {string} id - Product ID
 * @param {number} quantity - Quantity to add/subtract
 * @returns {Promise<Product>}
 */
export const updateStock = async (id, quantity) => {
    logger.info(`Updating stock for product: ${id}`);
    try {
        const product = await Product.findById(id);
        if (!product) {
            throw new AppError('Product not found', 404);
        }

        const newStock = product.stock + quantity;
        if (newStock < 0) {
            throw new AppError('Insufficient stock', 400);
        }

        product.stock = newStock;
        return await product.save();
    } catch (error) {
        logger.error('Stock update failed', { error: error.message });
        throw new AppError(error.message, error.statusCode || 500);
    }
};

/**
 * Fetches featured products
 * @returns {Promise<Array<Product>>}
 */
export const getFeaturedProducts = async () => {
    logger.info('Fetching featured products');
    try {
        return await Product.findFeatured();
    } catch (error) {
        logger.error('Featured products fetch failed', { error: error.message });
        throw new AppError('Failed to fetch featured products', 500);
    }
};