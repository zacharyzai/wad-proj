const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin-controller');

router.get('/dashboard', adminController.showDashboard);
router.post('/delete-user/:id', adminController.deleteUser);
router.get('/edit-user/:id', adminController.showEditUser);
router.post('/edit-user/:id', adminController.handleEditUser);

module.exports = router;