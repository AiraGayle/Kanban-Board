// Auth Routes — POST /auth/register and POST /auth/login
const express     = require('express');
const authService = require('../services/auth-service');

const router = express.Router();

function validateRegisterBody(email, password) {
    if (!email || !password) throw new Error('Email and password are required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email format');
    if (password.length < 8) throw new Error('Password must be at least 8 characters');
}

function validateLoginBody(email, password) {
    if (!email || !password) throw new Error('Email and password are required');
}

async function handleRegister(req, res) {
    const { email, password } = req.body;
    validateRegisterBody(email, password);
    const result = await authService.registerUser(email, password);
    res.status(201).json(result);
}

async function handleLogin(req, res) {
    const { email, password } = req.body;
    validateLoginBody(email, password);
    const result = await authService.loginUser(email, password);
    res.json(result);
}

function handleError(err, res) {
    const CLIENT_ERRORS = [
        'Email already in use',
        'Invalid email or password',
        'Email and password are required',
        'Invalid email format',
        'Password must be at least 8 characters',
    ];
    const status = CLIENT_ERRORS.includes(err.message) ? 400 : 500;
    res.status(status).json({ error: err.message });
}

router.post('/register', async (req, res) => {
    try {
        await handleRegister(req, res);
    } catch (err) {
        handleError(err, res);
    }
});

router.post('/login', async (req, res) => {
    try {
        await handleLogin(req, res);
    } catch (err) {
        handleError(err, res);
    }
});

module.exports = router;