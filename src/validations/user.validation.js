import Joi from 'joi';

/**
 * Base validation rules for common user fields
 */
const userValidationRules = {
    name: Joi.string().min(3).max(30),
    email: Joi.string().email(),
    password: Joi.string().min(6),
    phoneNumber: Joi.string().pattern(/^(?:\+216)?[0-9]{8}$/),
};

/**
 * @typedef {Object} UserValidation
 * @property {string} name - User's name (3-30 chars)
 * @property {string} email - Valid email address
 * @property {string} password - Password (min 6 chars)
 * @property {string} [phoneNumber] - Tunisia format phone number
 */

export const registerUserSchema = Joi.object({
    name: userValidationRules.name.required(),
    email: userValidationRules.email.required(),
    password: userValidationRules.password.required(),
    phoneNumber: userValidationRules.phoneNumber.optional(),
});

export const loginUserSchema = Joi.object({
    email: userValidationRules.email.required(),
    password: userValidationRules.password.required(),
});

export const updateUserSchema = Joi.object({
    name: userValidationRules.name.optional(),
    email: userValidationRules.email.optional(),
    password: userValidationRules.password.optional(),
});