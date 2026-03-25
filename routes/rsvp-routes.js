const express = require('express');
const rsvpController = require('./../controllers/rsvp-controller');

const router = express.Router();

// Create
router.get('/add-rsvp', rsvpController.showAddForm);
router.post('/add-rsvp', rsvpController.createRSVP);

// Read
router.get('/rsvp-list', rsvpController.showRSVPList);
router.get('/view-rsvp', rsvpController.getRSVP);

// Update
router.get('/update-rsvp', rsvpController.showUpdateForm);
router.post('/update-rsvp', rsvpController.updateRSVP);

// Delete
router.get('/delete-rsvp', rsvpController.showDeleteForm);
router.post('/delete-rsvp', rsvpController.deleteRSVP);

module.exports = router;