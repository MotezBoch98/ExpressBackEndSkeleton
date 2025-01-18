/**
 * Middleware to validate request body against a given schema.
 *
 * @param {Object} schema - The validation schema.
 * @returns {Function} Middleware function to validate request body.
 */
const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    next();
};

export default validate;