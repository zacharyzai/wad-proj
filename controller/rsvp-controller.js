const RSVP = require('./../models/rsvp-model');
const Event = require('./../models/event-models');


// SHOW ADD RSVP FORM
exports.showAddForm = async (req, res) => {
    try {
        let eventId = req.query.eventId;
        let event = await Event.findById(eventId);

        if (!event) {
            res.send("Event not found");
            return;
        }
        let msg = "";
        res.render("add-rsvp", { event, msg });
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
            res.send("Event not found");
            return;
        }

        if (status == "") {
            let result = "";
            let msg = "Status is required.";
            res.render("add-rsvp", { event, result, msg });
            return;
        }

        let existingRSVP = await RSVP.findByUserAndEvent(userId, eventId);

        if (existingRSVP) {
            let msg = "You have already RSVP'd for this event.";
            res.render("add-rsvp", { event, msg });
            return;
        }

        let newRSVP = {
            userId: userId,
            eventId: eventId,
            status: status,
            note: note
        };

        let result = await RSVP.addRSVP(newRSVP);
        res.render("add-rsvp", { result, msg: "RSVP successful!" });
        res.redirect("/rsvp-list");
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
        res.render("display-rsvp", { rsvpList });
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
            res.send("RSVP not found");
            return;
        }

        res.render("view-rsvp", { result });
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
            res.send("RSVP not found");
            return;
        }

        res.render("update-rsvp", { result });
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

        if (status == "") {
            res.send("Status is required.");
            return;
        }

        await RSVP.updateRSVP(rsvpId, status, note);

        res.redirect("/view-rsvp?id=" + rsvpId);
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
            res.send("RSVP not found");
            return;
        }

        res.render("delete-rsvp", { result });
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
            res.redirect("/rsvp-list");
        } else {
            res.send("RSVP not found.");
        }
    } catch (error) {
        console.error(error);
        res.send("Error deleting RSVP");
    }
};