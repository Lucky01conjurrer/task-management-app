const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Register a new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Logout user
router.post('/logout', protect, logout);

module.exports = router;
