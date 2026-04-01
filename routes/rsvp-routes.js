const express = require("express");
const rsvpController = require("../controller/rsvp-controller");

const router = express.Router();

router.post("/:id/rsvp", rsvpController.rsvpEvent);
router.post("/:id/unrsvp", rsvpController.unrsvpEvent);
router.get("/my-rsvps", rsvpController.myRsvpsPage);

module.exports = router;
