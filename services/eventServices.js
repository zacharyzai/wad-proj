const Event = require("../models/event-models");
const RSVP = require("../models/rsvp-models");
const Review = require("../models/review-models");

exports.deleteEventCascade = async (eventIds) => {
    if (!Array.isArray(eventIds)) {
        eventIds = [eventIds];
    } 
    //Delete RSVPs associated with the event(s)
    await RSVP.deleteMany({ event: { $in: eventIds } });

    //Delete reviews associated with the event(s)
    await Review.deleteMany({ event: { $in: eventIds } });

    //Delete the events themselves
    await Event.deleteMany({ _id: { $in: eventIds } });
};