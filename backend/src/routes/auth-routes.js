// Auth Routes — STUB
// TODO (Person 1): Implement POST /auth/register and POST /auth/login.
// Signature expected by app.js:  module.exports = express.Router()

const express = require('express');

const router = express.Router();

router.post('/register', (_req, res) => {
    res.status(501).json({ error: 'Not implemented yet — Person 1 owns this' });
});

router.post('/login', (_req, res) => {
    res.status(501).json({ error: 'Not implemented yet — Person 1 owns this' });
});

module.exports = router;
