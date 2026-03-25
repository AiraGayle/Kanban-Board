// Auth Middleware — verifies JWT and attaches user to request
const jwt = require('jsonwebtoken');

function extractToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    return authHeader.slice(7);
}

function authMiddleware(req, res, next) {
    const token = extractToken(req.headers.authorization);
    if (!token) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { userId: payload.userId, email: payload.email };
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

module.exports = authMiddleware;