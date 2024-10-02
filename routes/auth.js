const express = require('express');
const router = express.Router();

// Login page
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

// Register page
router.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

module.exports = router;
