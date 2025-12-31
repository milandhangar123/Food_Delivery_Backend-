const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not configured!');
        return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    // Support both `token` header and `Authorization: Bearer <token>`
    const tokenHeader = req.headers.token || req.headers.authorization;
    if (!tokenHeader) {
        return res.status(401).json({ success: false, message: 'Not Authorized. Login Again' });
    }

    // If Authorization header, it usually contains 'Bearer <token>'
    const token = tokenHeader.startsWith('Bearer ') ? tokenHeader.split(' ')[1] : tokenHeader;

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.body.userId = token_decode.id;
        req.userId = token_decode.id; // Also set on req object for easier access
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        return res.status(401).json({ success: false, message: 'Authentication failed' });
    }
};

module.exports = authMiddleware;