const express = require('express');
const { isAdmin } = require('../middleware/authMiddleware');

const eventController = require("./../controller/events-controller");

const router = express.Router();

// Read Event
router.get("/read-event", eventController.viewEventPage);

// Show page + RSVP route
router.get("/", eventController.renderEventsPage);
router.post("/:id/rsvp", eventController.rsvpEvent);


// Create Event
router.get("/create-event", isAdmin, eventController.createEventPage);
router.post("/create-event", isAdmin, eventController.createEvent);

// Update Event
router.get("/update-event", isAdmin, eventController.updateEventPage);
router.post("/update-event", isAdmin, eventController.updateEvent);

// Delete Event
router.get("/delete-event", isAdmin, eventController.renderDeletePage);
router.post("/delete-event", isAdmin, eventController.deleteEvent); 

// Review - show form and submit
router.get("/:id/review", eventController.addReviewPage);
router.post("/:id/review", eventController.addReview);

// View Event Details (must be last — /:id matches anything)
router.get("/:id", eventController.viewEventDetails);



module.exports = router;