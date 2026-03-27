// Auth Service — register and login business logic
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const pool   = require('../db/pool');

const SALT_ROUNDS    = 12;
const JWT_EXPIRES_IN = '7d';

function generateToken(userId, email) {
    return jwt.sign(
        { userId, email },
        process.env.JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

async function findUserByEmail(email) {
    const result = await pool.query(
        'SELECT id, email, password_hash FROM users WHERE email = $1',
        [email]
    );
    return result.rows[0] || null;
}

async function createUser(email, passwordHash) {
    const result = await pool.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
        [email, passwordHash]
    );
    return result.rows[0];
}

async function registerUser(email, password) {
    const existing = await findUserByEmail(email);
    if (existing) throw new Error('Email already in use');

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user         = await createUser(email, passwordHash);
    const token        = generateToken(user.id, user.email);

    return { user: { id: user.id, email: user.email }, token };
}

async function loginUser(email, password) {
    const user = await findUserByEmail(email);
    if (!user) throw new Error('Invalid email or password');

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) throw new Error('Invalid email or password');

    const token = generateToken(user.id, user.email);
    return { user: { id: user.id, email: user.email }, token };
}

module.exports = { registerUser, loginUser };