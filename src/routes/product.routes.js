import express from 'express';
import {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    getFeaturedProducts
} from '../controllers/product.controller.js';
import { authenticated } from '../middlewares/auth.middleware.js';
import { authorized } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { productValidation } from '../validations/product.validation.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - price
 *         - category
 *         - stock
 *       properties:
 *         title:
 *           type: string
 *           description: Product title
 *         description:
 *           type: string
 *           description: Product description
 *         price:
 *           type: number
 *           description: Product price
 *         category:
 *           type: string
 *           enum: [Goods, Food, Drink, Other]
 *         stock:
 *           type: number
 *           description: Available quantity
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *         featured:
 *           type: boolean
 *           default: false
 */

/**
 * @swagger
 * tags:
 *   name: Product Management
 *   description: API endpoints for product management
 */


// Public routes

/**
 * @swagger
 * /api/product-management/products:
 *   get:
 *     summary: Get all products
 *     tags: [Product Management]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Internal server error
 */
router.get('/products', getProducts);

/**
 * @swagger
 * /api/product-management/products/featured:
 *   get:
 *     summary: Get featured products
 *     tags: [Product Management]
 *     responses:
 *       200:
 *         description: List of featured products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Internal server error
 */
router.get('/products/featured', getFeaturedProducts);

/**
 * @swagger
 * /api/product-management/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Product Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get('/products/:id', getProduct);

// Protected routes (admin only)

/**
 * @swagger
 * /api/product-management/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Product Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.post(
    '/products',
    authenticated,
    authorized(['admin']),
    validate(productValidation.createProduct),
    createProduct
);

/**
 * @swagger
 * /api/product-management/products/{id}:
 *   put:
 *     summary: Update a product by ID
 *     tags: [Product Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.put(
    '/products/:id',
    authenticated,
    authorized(['admin']),
    validate(productValidation.updateProduct),
    updateProduct
);

/**
 * @swagger
 * /api/product-management/products/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Product Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.delete(
    '/products/:id',
    authenticated,
    authorized(['admin']),
    deleteProduct
);

/**
 * @swagger
 * /api/product-management/products/{id}/stock:
 *   patch:
 *     summary: Update product stock
 *     tags: [Product Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: number
 *                 description: Quantity to add or subtract
 *             example:
 *               quantity: 10
 *     responses:
 *       200:
 *         description: Stock updated successfully
 *       400:
 *         description: Invalid quantity or insufficient stock
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.patch(
    '/products/:id/stock',
    authenticated,
    authorized(['admin']),
    validate(productValidation.updateStock),
    updateStock
);

export default router;