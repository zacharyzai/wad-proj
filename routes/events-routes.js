const express = require('express');

const eventController = require("./../controller/events-controller");

const router = express.Router();

// Read Event
router.get("/read-event", eventController.viewEventPage);

// Show page + RSVP route
router.get("/", eventController.renderEventsPage);
router.post("/:id/rsvp", eventController.rsvpEvent);


// Create Event
router.get("/create-event", eventController.createEventPage);
router.post("/create-event", eventController.createEvent);

// Update Event
router.get("/update-event", eventController.updateEventPage);
router.post("/update-event", eventController.updateEvent);

// Delete Event
router.get("/delete-event", eventController.renderDeletePage);
router.post("/delete-event", eventController.deleteEvent); 

// View Event Details
router.get("/:id", eventController.viewEventDetails);

// Get Event Details
router.get("/:id", eventController.getEventDetails);



module.exports = router;