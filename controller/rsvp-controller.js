const Event = require("../models/event-models");
const RSVP = require("../models/rsvp-models");
const Notification = require("../models/notification-models");

// RSVP
exports.rsvpEvent = async (req, res) => {
  try {
    const sort = req.body.sort !== undefined ? req.body.sort : "upcoming";
    const page = req.body.page || 1;

    const event = await Event.findById(req.params.id);

    const existingRsvp = await RSVP.findOne({
      event: req.params.id,
      user: req.session.userId,
    });

    if (existingRsvp) {
      existingRsvp.status = "attending";
      await existingRsvp.save();
    } else {
      await RSVP.create({
        event: req.params.id,
        user: req.session.userId,
        status: "attending",
      });
    }
    if (!event) {
      return res.status(404).redirect(`/events?sort=${sort}&page=${page}`);
    }

    if (event.attendees && event.attendees.includes(req.session.userId)) {
      return res.redirect(`/events?sort=${sort}&page=${page}`);
    }

    if (event.date < new Date()) {
      return res.redirect(`/events?sort=${sort}&page=${page}`);
    }


    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return res.redirect(`/events?sort=${sort}&page=${page}&error=full`);
    }


    await Event.findByIdAndUpdate(req.params.id, {
      $addToSet: { attendees: req.session.userId },
    });

    if (event.organiser && event.organiser.toString() !== req.session.userId) {
      await Notification.create({
        recipient: event.organiser,
        message: `Someone RSVPed to your event: ${event.title}`
      });
    }

    res.redirect(`/events?sort=${sort}&page=${page}`);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// UNRSVP
exports.unrsvpEvent = async (req, res) => {
  try {
    await Event.findByIdAndUpdate(req.params.id, {
      $pull: { attendees: req.session.userId },
    });

    const existingRsvp = await RSVP.findOne({
      event: req.params.id,
      user: req.session.userId,
    });

    if (existingRsvp) {
      existingRsvp.status = "cancelled";
      await existingRsvp.save();
    }

    res.redirect("/rsvp/my-rsvps");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// RSVP Page
exports.myRsvpsPage = async (req, res) => {
  try {
    const rsvps = await RSVP.find({
      user: req.session.userId,
      status: "attending",
    })
      .populate("event")
      .sort({ createdAt: -1 });

    res.render("rsvp/my-rsvps", { rsvps });
  } catch (err) {
    console.error(err);
    res.send("Error loading RSVP page.");
  }
};
