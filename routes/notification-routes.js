const express = require('express');
const router = express.Router();
const { getNotificationsPage, markAsRead } = require('../controller/notification-controller');

router.get('/', getNotificationsPage);
router.post('/:id/read', markAsRead);

module.exports = router;
