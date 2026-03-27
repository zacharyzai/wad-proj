const Event = require("../models/event-models");
const Review = require("../models/review-models"); // added for review


// Read (user sees all the available events on a particular date)
exports.viewEventPage = async (req,res) => {
    try {
        const events = await Event.find(); // fetch from MongoDB
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
;
}
// Render (what user sees when clicked into one event)
exports.renderEventsPage = async (req,res) => {
    try {
        const events = await Event.find();
        const myEvents = await Event.find({attendees: req.session.userId}); // Specific user would be able to see events they RSVP'ed for
        const success = req.query.success;
        const role = req.session.role;


        res.render("event-view", {events, success, role, myEvents}); //pass data to EJS
    } catch (error) {
        res.status(500).send(error.message)
    }
};

// RSVP 
exports.rsvpEvent = async(req,res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event.attendees) {
            event.attendees = [];
        }
        event.attendees.push(req.session.userId); 

        await event.save();
        res.redirect("/events"); //page reloads after rsvp
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// UNRSVP
exports.unrsvpEvent = async (req, res) => {
    try {
        await Event.findByIdAndUpdate(req.params.id, {
            $pull: { attendees: req.session.userId } // $pull function is the opposite $push. It removes all instances of a matching value from the array
        });
        res.redirect("/events");
    } catch (error) {
        res.status(500).send(error.message);
    }
};


// Create Event (Have a button visible to admins only to create an event)

exports.createEventPage = (req,res) => {
    try {
        res.render("create-event", {
            title: "",
            description: "",
            date: "",
            location: "",
            category: ""
        })
    } catch (err) {
        console.error(err)
        res.send("Error creating event. Please try again");
    };
}

exports.createEvent = async (req, res) => {
    let title = req.body.title;
    let description = req.body.description;
    let date = req.body.date;
    let location = req.body.location;
    let category = req.body.category;

    // To ensure all the fields are present, else, render them back to the same link + error shown
    if (!title || !category || !description || !location || !date) {
        return res.render("create-event", {error: "All fields are required", 
            title, category, description, location, date
        });
    };

    try {
        const newEvent = {
            title: title,
            description: description,
            date: date,
            location: location,
            category: category,
            organiser: req.session.userId
        };

        let result = await Event.create(newEvent);
        console.log("My Log:", result);

        res.redirect("/events?success=true")

    } catch (err) {
        console.error("Database error:", err);
        res.render("create-event", {error: "An error occured while saving to database",
            title, category, description, location, date
        });
    };

};

// Update Event (Have a button visible to admins only to allow them to UPDATE an event)
exports.updateEventPage = async (req,res) => {
    try {
        let targetId = req.query.eventId; // need to get from events viewing page when use click the specific event

        let eventToEdit = await Event.findById(targetId)

        // Conversion of "datetime-local" to a format that is compatible with HTML
        let formattedDateForHTML = eventToEdit.date.toISOString().slice(0, 16); // slice away the seconds + ISOString() --> converts JS Date object into standardised string format, needed to allow HTML to recognise the data
        res.render("update-event", {
            targetId,
            title: eventToEdit.title,
            description: eventToEdit.description,
            date: formattedDateForHTML,
            location: eventToEdit.location,
            category: eventToEdit.category,
        })

    } catch (err) {
        console.error("Error:", err);
        res.send("Error updating the event. Please try again.")
    }
}

exports.updateEvent = async (req, res) => {
    try {
        const targetId = req.query.eventId
        let title = req.body.title;
        let description = req.body.description;
        let date = req.body.date; 
        let location = req.body.location;
        let category = req.body.category;

        if (!title || !description || !date || !location || !category) {
            return res.render("update-event", {
                error: "All fields are required",
                targetId, title, description, date, location, category
            });
        }
        

        const updatedEvent = await Event.findByIdAndUpdate(
            targetId,
            {title, description, date, location, category}
        )
        res.redirect('/events?success=true') // ? is a query string and success = true is used to display message whether the update is confirmed under events page
    } catch (err) {
        console.error("Error saving the update:", err)
        res.send("Error occurred while trying to update the event.")
    }  
}

// Delete Event (Have a button visible to admins only to allow them to DELETE an event)

exports.renderDeletePage = async (req,res) => {
    try {
        let allEvents = await Event.find()
        res.render("delete-events", {events: allEvents})
    } catch (err) {
        console.error(err)
        res.send("Error loading the delete page.")
    }
}

exports.deleteEvent = async (req,res) => {
    try {
        let deleteEvent = req.body.deleteEventIds;
        

        if (!deleteEvent) {
            const allEvents = await Event.find();
            return res.render("delete-events", {
                events: allEvents,
                error: "Please select at least one event to delete."
            })
        }

        if (typeof(deleteEvent) === "string") {
            deleteEvent = [deleteEvent];
        };

        await Event.deleteMany({ _id : { $in: deleteEvent}}); // $in in MongoDB operator means match any value in this array

        res.redirect("/events?success=true");
    } catch (err) {
        console.log(err)
        res.send("An error occurred while trying to delete the event(s).")
    }
}

// View Extra details of the event
exports.viewEventDetails = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organiser', 'name')
            .populate('reviews');
        
        if (!event) {
            return res.send("Event not found.");
        }

        res.render("event-details", {event, role: req.session.role});
    } catch (err) {
        console.error(err);
        res.send("Error loading event details.");
    }
};

// To view the Add Review Page
exports.addReviewPage = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.send("Event not found.");
        }
        res.render("create-review", { event });
    } catch (err) {
        console.error(err);
        res.send("Error loading review page.");
    }
};


// To add review
exports.addReview = async (req, res) => {
    try {
        const { title, rating, comment } = req.body;

        if (!title || !rating || !comment) {
            return res.redirect("/events/" + req.params.id);
        }

        const review = await Review.create({
            event: req.params.id,
            user: req.session.userId,
            title,
            rating,
            comment
        });

        // Push the review ID into the event's reviews array
        await Event.findByIdAndUpdate(req.params.id, {
            $push: { reviews: review._id }
        });

        res.redirect("/events/" + req.params.id);
    } catch (err) {
        console.error(err);
        res.send("Error adding review.");
    }
};



exports.getEventDetails = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate("reviews"); // if you want reviews shown

        res.render("event-view", { event });
    } catch (err) {
        console.error(err);
        res.send("Error loading event");
    }
};
exports.deleteReview = async(req,res) => {
    try {
        const { id, reviewId } =
    }
}

