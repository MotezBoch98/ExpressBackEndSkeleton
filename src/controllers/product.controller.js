import * as productService from '../services/product.service.js';
import logger from '../config/logger.js';

export const createProduct = async (req, res) => {
    try {
        const product = await productService.createProduct(req.body);
        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        logger.error('Create product controller error', { error: error.message });
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

export const getProducts = async (req, res) => {
    try {
        const products = await productService.getProducts(req.query);
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        logger.error('Get products controller error', { error: error.message });
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

export const getProduct = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        logger.error('Get product controller error', { error: error.message });
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await productService.updateProduct(req.params.id, req.body);
        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        logger.error('Update product controller error', { error: error.message });
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        await productService.deleteProduct(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        logger.error('Delete product controller error', { error: error.message });
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateStock = async (req, res) => {
    try {
        const product = await productService.updateStock(req.params.id, req.body.quantity);
        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        logger.error('Update stock controller error', { error: error.message });
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

export const getFeaturedProducts = async (req, res) => {
    try {
        const products = await productService.getFeaturedProducts();
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        logger.error('Get featured products controller error', { error: error.message });
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};