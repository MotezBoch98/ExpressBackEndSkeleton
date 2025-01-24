import Joi from 'joi';

/**
 * Schema for validating user registration data.
 * 
 * @constant
 * @type {Object}
 * @property {string} name - The name of the user. Must be a string between 3 and 30 characters.
 * @property {string} email - The email of the user. Must be a valid email address.
 * @property {string} password - The password of the user. Must be a string with a minimum length of 6 characters.
 * @property {string} [phoneNumber] - The phone number of the user. Must be a string matching the pattern /^(?:\+216)?[0-9]{8}$/.
 */
export const registerUserSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phoneNumber: Joi.string().pattern(/^(?:\+216)?[0-9]{8}$/).optional(),
});

/**
 * Schema for validating user login.
 * 
 * @constant
 * @type {Object}
 * @property {string} email - The user's email address. Must be a valid email format and is required.
 * @property {string} password - The user's password. Must be at least 6 characters long and is required.
 */
export const loginUserSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

/**
 * Schema for validating user update requests.
 * 
 * This schema validates the following fields:
 * - `name`: An optional string with a minimum length of 3 and a maximum length of 30.
 * - `email`: An optional string that must be a valid email address.
 * - `password`: An optional string with a minimum length of 6.
 * 
 * @type {Object}
 * @property {Joi.StringSchema} name - Optional name with length between 3 and 30 characters.
 * @property {Joi.StringSchema} email - Optional email that must be a valid email address.
 * @property {Joi.StringSchema} password - Optional password with a minimum length of 6 characters.
 */
export const updateUserSchema = Joi.object({
    name: Joi.string().min(3).max(30).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
});