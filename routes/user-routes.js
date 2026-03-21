const express = require('express');
const router = express.Router();
const userController = require('../controller/user-controller');

router.get('/', userController.getProfile);

router.get('/edit', userController.getEditProfile);

router.post('/edit', userController.updateProfile);

module.exports = router;