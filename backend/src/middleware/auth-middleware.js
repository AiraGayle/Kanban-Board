// Auth Middleware — STUB
// TODO (Person 1): Replace this with real JWT verification using jsonwebtoken.
// This passthrough lets the server run locally while Person 1 builds auth.
// DO NOT ship this stub — it must be replaced before integration testing.

function authMiddleware(req, _res, next) {
    // Temporary fake user so task routes can be tested without a real token.
    req.user = { userId: 1, email: 'dev@example.com' };
    next();
}

module.exports = authMiddleware;
