/**
 * Middleware to check if the user's role is authorized.
 * 
 * @param {string[]} roles - Array of roles that are allowed access.
 * @returns {Function} Middleware function to check the user's role.
 */
const checkRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
};

export default checkRole;