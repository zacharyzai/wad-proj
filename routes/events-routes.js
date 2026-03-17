const express = require('express');

const eventController = require("./../controller/events-controller");

const router = express.Router();

// Create Event
router.get("/create-event", eventController.createEventPage);
router.post("/create-event", eventController.createEvent);

// Update Event

// Delete Event



module.exports = router;