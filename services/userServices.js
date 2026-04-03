const mongoose = require("mongoose");
const User = require("../models/user-models");
const Event = require("../models/event-models");
const RSVP = require("../models/rsvp-models");
const Review = require("../models/review-models");
const Notification = require("../models/notification-models");


exports.deleteUserCascade = async (userId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID format");
        }

        // Delete all reviews created by the user
        await Review.deleteMany({ user: userId });

    // Find all events organized by the user
    const events = await Event.find({ organiser: userId });
    const eventIds = [];
    for (const e of events) {
        eventIds.push(e._id);
    }

    //Delete all reviews associated with those events
    if (eventIds.length > 0) {
        await Review.deleteMany({ event: { $in: eventIds } });
    }

    // Optional: remove the deleted review IDs from events' reviews arrays
    if (eventIds.length > 0) {
        await Event.updateMany(
        { _id: { $in: eventIds } },
        { $set: { reviews: [] } } // clear reviews array
        );
    }

    //Delete all events created by the user
    await Event.deleteMany({ organiser: userId });

    //Remove user from attendees lists of all remaining events
    await Event.updateMany({}, { $pull: { attendees: userId } });

    //Delete all RSVPs made by the user
    await RSVP.deleteMany({ user: userId });

    //Delete all notifications sent to the user
    await Notification.deleteMany({ recipient: userId });

    //Finally, delete the user record
    await User.findByIdAndDelete(userId);
    }
    catch(err){
        console.error(err)
    }
};