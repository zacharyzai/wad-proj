const express = require('express');

const eventController = require("./../controller/events-controller");

const router = express.Router();

// Create Event
router.get("/create-event", eventController.createEventPage);
router.post("/create-event", eventController.createEvent);

// Update Event
router.get("/update-event", eventController.updateEventPage);
// router.post("update-event", eventController.updateEvent);

// Delete Event
router.post("/delete-event", eventController.deleteEvent);


module.exports = router;