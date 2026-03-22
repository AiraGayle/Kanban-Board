const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/auth-middleware');

const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../data/users.json');


// ✅ GET board (load tasks)
router.get('/', authenticateToken, (req, res) => {
    const users = JSON.parse(fs.readFileSync(usersFilePath));
    const user = users.find(u => u.email === req.user.email);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json({ board: user.board || [] });
});


// ✅ SAVE board (this is the code you asked about)
router.post('/', authenticateToken, (req, res) => {
    const users = JSON.parse(fs.readFileSync(usersFilePath));
    const user = users.find(u => u.email === req.user.email);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    user.board = req.body.board;

    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

    res.json({ message: "Board saved" });
});


module.exports = router;