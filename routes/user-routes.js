const express = require('express');
const router = express.Router();
const userController = require('../controller/user-controller');
const isAuthenticated = require('../middleware/authMiddleware');

// View profile
router.get('/profile', isAuthenticated, userController.getProfile);

// Edit profile page
router.get('/profile/edit', isAuthenticated, userController.getEditProfile);

// Update profile (CRUD)
router.post('/profile/edit', isAuthenticated, userController.updateProfile);

module.exports = router;