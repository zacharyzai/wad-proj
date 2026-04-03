const express = require('express');
const router = express.Router();

const organizerController = require("../controller/organizer-controller")

// Organizer Analytics
router.get("/organizer-analytics", organizerController.organizerAnalyticsPage);

module.exports = router;