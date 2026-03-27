const express = require('express');
const { isAdmin, isAuthenticated } = require('../middleware/authMiddleware');

const eventController = require("./../controller/events-controller");

const router = express.Router();

// Read Event
router.get("/read-event", eventController.viewEventPage);

// Show page + RSVP route
router.get("/", eventController.renderEventsPage);
router.post("/:id/rsvp", isAuthenticated, eventController.rsvpEvent);

// To Un-RSVP
router.post("/:id/unrsvp", isAuthenticated, eventController.unrsvpEvent);


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
router.get("/:id/review", isAuthenticated, eventController.addReviewPage);
router.post("/:id/review", isAuthenticated, eventController.addReview);

// View Event Details (must be last — /:id matches anything)
router.get("/:id", eventController.viewEventDetails);

// Delete Review (Admin only) - must be before /:id
router.post("/:id/review/:reviewId/delete", isAdmin, eventController.deleteReview);

module.exports = router;