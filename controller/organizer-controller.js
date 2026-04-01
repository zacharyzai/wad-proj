const Event = require("../models/event-models");

// Organizer Analytics Page
exports.organizerAnalyticsPage = async (req, res) => {
    try {
        // Only show events created by the logged-in organizer
        const organizerEvents = await Event.find({ organiser: req.session.userId })
            .populate("attendees", "name email")
            .sort({ date: 1 });

        res.render("organizer-analytics", {
            events: organizerEvents,
            role: req.session.role
        });
    } catch (err) {
        console.error(err);
        res.send("Error loading organizer analytics page.");
    }
};