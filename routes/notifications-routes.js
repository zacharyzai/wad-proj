const express = require("express");
const router = express.Router();

const notificationsController = require("../controller/notifications-controller");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.get("/", isAuthenticated, notificationsController.notificationsPage);

module.exports = router;