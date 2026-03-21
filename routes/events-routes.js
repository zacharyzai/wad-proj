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
router.post("/update-event", eventController.updateEvent);

// Delete Event
router.get("/delete-event", eventController.renderDeletePage); // To view the table of events that may be deleted
router.post("/delete-event", eventController.deleteEvent); // To show the success of the deletion of the page and back to Events Home Page button


module.exports = router;