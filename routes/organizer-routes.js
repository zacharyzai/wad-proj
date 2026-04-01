const express = require('express');
const router = express.Router();

const organizerController = require("../controller/organizer-controller")
const { isAuthenticated, isOrganizer } = require('../middleware/authMiddleware');

// Organizer Analytics
router.get("/organizer-analytics", organizerController.organizerAnalyticsPage);

module.exports = router;