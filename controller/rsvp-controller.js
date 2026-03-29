const RSVP = require('./../models/rsvp-model');
const Event = require('./../models/event-models');

// SHOW ADD RSVP FORM
exports.showAddForm = async (req, res) => {
    try {
        let eventId = req.query.eventId;
        let event = await Event.findById(eventId);

        if (!event) {
            return res.send("Event not found");
        }

        res.render("add-rsvp", { event, msg: "" });
    } catch (error) {
        console.error(error);
        res.send("Error loading RSVP form");
    }
};

// CREATE RSVP
exports.createRSVP = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.send("You must be logged in to RSVP.");
        }

        let eventId = req.body.eventId;
        let userId = req.session.user.id;
        let status = req.body.status;
        let note = req.body.note;

        let event = await Event.findById(eventId);

        if (!event) {
            return res.send("Event not found");
        }

        if (!status) {
            return res.render("add-rsvp", {
                event,
                msg: "Status is required."
            });
        }

        let existingRSVP = await RSVP.findByUserAndEvent(userId, eventId);

        if (existingRSVP) {
            return res.render("add-rsvp", {
                event,
                msg: "You have already RSVP'd for this event."
            });
        }

        let newRSVP = {
            userId: userId,
            eventId: eventId,
            status: status,
            note: note
        };

        let result = await RSVP.addRSVP(newRSVP);

        res.render("success-rsvp", { event, result });
    } catch (error) {
        console.error(error);
        res.send("Error creating RSVP");
    }
};

// SHOW ALL RSVPS FOR LOGGED-IN USER
exports.showRSVPList = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.send("You must be logged in to view your RSVPs.");
        }

        let userId = req.session.user.id;
        let rsvpList = await RSVP.findAllByUser(userId);

        let rsvpData = [];

        for (let rsvp of rsvpList) {
            let event = await Event.findById(rsvp.eventId);
            rsvpData.push({ rsvp, event });
        }

        res.render("display-rsvp", { rsvpData });
    } catch (error) {
        console.error(error);
        res.send("Error reading database");
    }
};

// SHOW ONE RSVP
exports.getRSVP = async (req, res) => {
    try {
        let rsvpId = req.query.id;
        let result = await RSVP.findById(rsvpId);

        if (!result) {
            return res.send("RSVP not found");
        }

        let event = await Event.findById(result.eventId);

        if (!event) {
            return res.send("Event not found");
        }

        res.render("view-rsvp", { result, event });
    } catch (error) {
        console.error(error);
        res.send("Error loading RSVP");
    }
};

// SHOW UPDATE FORM
exports.showUpdateForm = async (req, res) => {
    try {
        let rsvpId = req.query.id;
        let result = await RSVP.findById(rsvpId);

        if (!result) {
            return res.send("RSVP not found");
        }

        let event = await Event.findById(result.eventId);

        if (!event) {
            return res.send("Event not found");
        }

        res.render("update-rsvp", { result, event });
    } catch (error) {
        console.error(error);
        res.send("Error loading update form");
    }
};

// UPDATE RSVP
exports.updateRSVP = async (req, res) => {
    try {
        let rsvpId = req.body.rsvpId;
        let status = req.body.status;
        let note = req.body.note;

        if (!status) {
            return res.send("Status is required.");
        }

        await RSVP.updateRSVP(rsvpId, status, note);

        res.redirect("/rsvp/view-rsvp?id=" + rsvpId);
    } catch (error) {
        console.error(error);
        res.send("Error updating RSVP");
    }
};

// SHOW DELETE PAGE
exports.showDeleteForm = async (req, res) => {
    try {
        let rsvpId = req.query.id;
        let result = await RSVP.findById(rsvpId);

        if (!result) {
            return res.send("RSVP not found");
        }

        let event = await Event.findById(result.eventId);

        if (!event) {
            return res.send("Event not found");
        }

        res.render("delete-rsvp", { result, event });
    } catch (error) {
        console.error(error);
        res.send("Error loading delete page");
    }
};

// DELETE RSVP
exports.deleteRSVP = async (req, res) => {
    try {
        let rsvpId = req.body.rsvpId;
        let success = await RSVP.deleteRSVP(rsvpId);

        if (success.deletedCount === 1) {
            res.redirect("/rsvp/rsvp-list");
        } else {
            res.send("RSVP not found.");
        }
    } catch (error) {
        console.error(error);
        res.send("Error deleting RSVP");
    }
};