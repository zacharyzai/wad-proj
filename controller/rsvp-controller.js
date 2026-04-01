const Event = require("../models/event-models");
const RSVP = require("../models/rsvp-models");

// RSVP
exports.rsvpEvent = async (req, res) => {
  try {
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
      return res.status(404).redirect("/events?sort=upcoming");
    }

    if (event.attendees && event.attendees.includes(req.session.userId)) {
      return res.redirect("/events?sort=upcoming");
    }

    if (event.date < new Date()) {
      return res.redirect("/events?sort=upcoming");
    }

    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return res.redirect("/events?sort=upcoming&error=full");
    }

    await Event.findByIdAndUpdate(req.params.id, {
      $addToSet: { attendees: req.session.userId },
    });

    const sort = req.body.sort || "upcoming";
    const page = req.body.page || 1;

    res.redirect(`/events?sort=${sort}&page=${page}`);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// UNRSVP
exports.unrsvpEvent = async (req, res) => {
  try {
    await Event.findByIdAndUpdate(req.params.id, {
      $pull: { attendees: req.session.userId }, // $pull function is the opposite $push. It removes all instances of a matching value from the array
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
