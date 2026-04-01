const RSVP = require("../models/rsvp-models");

exports.notificationsPage = async (req, res) => {
    try {
        const now = new Date();

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const rsvps = await RSVP.find({
            user: req.session.userId,
            status: "attending"
        })
        .populate("event")
        .sort({ createdAt: -1 });

        let happeningToday = [];
        let endedToday = [];

        rsvps.forEach(rsvp => {
            if (!rsvp.event) return;

            const eventDate = new Date(rsvp.event.date);

            if (
                eventDate >= startOfToday &&
                eventDate <= endOfToday &&
                eventDate >= now
            ) {
                happeningToday.push(rsvp);
            } else if (
                eventDate >= startOfToday &&
                eventDate <= endOfToday &&
                eventDate < now
            ) {
                endedToday.push(rsvp);
            }
        });

        res.render("notifications", {
            happeningToday,
            endedToday,
            rsvps
        });

    } catch (err) {
        console.error(err);
        res.send("Error loading notifications.");
    }
};