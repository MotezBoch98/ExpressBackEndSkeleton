import Joi from 'joi';

/**
 * Base validation rules for product fields
 */
const productValidationRules = {
    title: Joi.string().min(3).max(100),
    description: Joi.string().min(10).max(2000),
    price: Joi.number().min(0),
    category: Joi.string().valid('Goods', 'Food', 'Drink', 'Other'),
    stock: Joi.number().min(0),
    images: Joi.array().items(
        Joi.object({
            url: Joi.string().uri().optional()
        })
    ),
    featured: Joi.boolean()
};

export const productValidation = {
    createProduct: Joi.object({
        title: productValidationRules.title.required(),
        description: productValidationRules.description.required(),
        price: productValidationRules.price.required(),
        category: productValidationRules.category.required(),
        stock: productValidationRules.stock.required(),
        images: productValidationRules.images.optional(),
        featured: productValidationRules.featured.optional()
    }),

    updateProduct: Joi.object({
        title: productValidationRules.title.optional(),
        description: productValidationRules.description.optional(),
        price: productValidationRules.price.optional(),
        category: productValidationRules.category.optional(),
        stock: productValidationRules.stock.optional(),
        images: productValidationRules.images.optional(),
        featured: productValidationRules.featured.optional()
    }),

    updateStock: Joi.object({
        quantity: Joi.number().required()
            .messages({
                'number.base': 'Quantity must be a number',
                'any.required': 'Quantity is required'
            })
    })
};