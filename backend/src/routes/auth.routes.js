const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post(
    '/register',
    [
        body('username').isLength({ min: 2 }).withMessage('Username must be at least 2 characters'),
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ],
    authController.register
);

router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    authController.login
);

// Protected routes
router.post('/logout', protect, authController.logout);
router.get('/profile', protect, authController.getProfile);

module.exports = router;