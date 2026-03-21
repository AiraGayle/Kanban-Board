
const express = require('express');
const router = express.Router();

const autenticateToken = require('../middleware/auth-middleware');

router.get('/', autenticateToken, (req, res) => {

    res.json({message: `welcome ${req.user.email} to the board data!`});

});

module.exports = router;