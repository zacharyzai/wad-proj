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

// View Event Details 
router.get("/:id", eventController.viewEventDetails);

module.exports = router;