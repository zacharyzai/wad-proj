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

// Review - show form and submit
router.get("/:id/review", eventController.addReviewPage);
router.post("/:id/review", eventController.addReview);

// View Event Details (must be last — /:id matches anything)
router.get("/:id", eventController.viewEventDetails);



module.exports = router;