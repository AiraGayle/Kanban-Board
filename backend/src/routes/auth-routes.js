// Auth Routes — STUB
// TODO (Person 1): Implement POST /auth/register and POST /auth/login.
// Signature expected by app.js:  module.exports = express.Router()


const fs = require('fs');
const path = require('path');

const express = require('express');


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const usersFilePath = path.join(__dirname, '../data/users.json');

const router = express.Router();
const SECRET_KEY = "hollanov";

//valudate email

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);

}

// POST /auth/register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields required" });
    }

    const users = JSON.parse(fs.readFileSync(usersFilePath));

    if (users.find(u => u.email === email)) {
        return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log("Writing to:", usersFilePath);

    users.push({ username, email, password: hashedPassword });

    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

    const token = jwt.sign({ email, username }, SECRET_KEY, { expiresIn: '1h' });

    res.status(201).json({
        message: "User registered successfully",
        token
    });
});

//POST /auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const users = JSON.parse(fs.readFileSync(usersFilePath));

    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(400).json({
            message: "No account found. Please register first."
        });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
        return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
        { email: user.email, username: user.username },
        SECRET_KEY,
        { expiresIn: '1h' }
    );

    res.json({ token });
});

module.exports = router;


