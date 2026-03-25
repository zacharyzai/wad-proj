const express = require('express');

const eventController = require("./../controller/events-controller");

const router = express.Router();

// Add Review to Event
router.post("/:id/review", eventController.addReview);



module.exports = router;