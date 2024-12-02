import jwt from 'jsonwebtoken';

const authenticated = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        console.error('Access denied. No token provided.');
        return res.status(401).send({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (ex) {
        console.error('Invalid token:', ex.message);
        res.status(400).send({ error: 'Invalid token.' });
    }
};

export default authenticated;
