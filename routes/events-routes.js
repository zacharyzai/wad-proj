const express = require('express');

const eventController = require("./../controller/events-controller");

const router = express.Router();

// Read Event
router.get("/read-event", eventController.viewEventPage);

// Render Event
router.get("/events", eventController.renderEventsPage);
router.post("/events/:id/rsvp", eventController.rsvpEvent);

// Create Event
router.get("/create-event", eventController.createEventPage);
router.post("/create-event", eventController.createEvent);

// Update Event
router.get("/update-event", eventController.updateEventPage);
router.post("update-event", eventController.updateEvent);

// Delete Event



module.exports = router;