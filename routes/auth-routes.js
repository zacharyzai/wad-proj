const express = require('express');
const router = express.Router();
const authController = require('../controller/auth-controller');

router.get('/register', authController.registerGet);

router.post('/register', authController.registerPost);

router.get('/login', authController.loginGet);

router.post('/login', authController.loginPost);

router.get('/logout', authController.logoutGet);

module.exports = router;