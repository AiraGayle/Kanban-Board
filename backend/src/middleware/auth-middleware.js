// Auth Middleware — STUB
// TODO (Person 1): Replace this with real JWT verification using jsonwebtoken.
// This passthrough lets the server run locally while Person 1 builds auth.
// DO NOT ship this stub — it must be replaced before integration testing.

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
