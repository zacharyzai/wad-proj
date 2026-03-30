const Event = require("../models/event-models");



// Read (user sees all the available events on a particular date)
exports.viewEventPage = async (req, res) => {
    try {
        const events = await Event.find(); // fetch from MongoDB
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
    ;
}
// Render (what user sees when clicked into one event)
exports.renderEventsPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        const category = req.query.category;
        const sort = req.query.sort !== undefined ? req.query.sort : "upcoming";

        let filter = {};
        let selectedCategories = [];
        if (category) {
            selectedCategories = Array.isArray(category) ? category : [category];
            filter.category = { $in: selectedCategories };
        }

        // if (sort === "popular") {
        //     events = events.sort((a, b) => (b.attendees?.length || 0) - (a.attendees?.length || 0));
        // } else if (sort === "newest") {
        //     events = await Event.find(filter).sort({ date: -1 }).skip(skip).limit(limit);
        // } else if (sort === "oldest") {
        //     events = await Event.find(filter).sort({ date: 1 }).skip(skip).limit(limit);
        // }

        if (sort === "upcoming") {
            filter.date = { $gte: new Date() };
        } else if (sort === "past") {
            filter.date = { $lt: new Date() };
        }

        const search = req.query.search || "";
        if (search) {
            filter.$or = [ // $or means match title or location 
                { title: { $regex: search, $options: "i" } },  // $regex is MongoDB's pattern matching like SQL LIKE
                { location: { $regex: search, $options: "i" } } // $options: 'i' make it case-insensitive
            ];
        }

        let events;
        if (sort === "popular") {
            const allEvents = await Event.find(filter); // Get all events
            allEvents.sort((a,b) => (b.attendees?.length || 0) - (a.attendees?.length || 0)); // Sort ALL by attendance
            events = allEvents.slice(skip, skip + limit); // Cut out 5 just for the first page
        } else {
            events = await Event.find(filter).sort({date:1}).skip(skip).limit(limit);
        }

        const totalPages = Math.ceil((await Event.countDocuments(filter)) / limit);
        const myEvents = await Event.find({ attendees: req.session.userId, date: { $gte: new Date() } }); // Now users will only see upcoming events
        const success = req.query.success;
        const role = req.session.role;
        const categories = ['General', 'Sports', 'Festivals', 'Hackathons', 'Discussions', 'Networking', 'Others'];

        let allCategories = []; // Used to recommend users events based on their past attendance 
        for (let event of myEvents) {
            for (let cat of event.category) {
                allCategories.push(cat);
            };
        };

        let attendedCategories = [];
        for (let cat of allCategories) {
            if (!attendedCategories.includes(cat)) {
                attendedCategories.push(cat);
            };
        };

        let recommendedEvents;
        if (attendedCategories.length > 0) {
            recommendedEvents = await Event.find({
                category: { $in: attendedCategories },
                attendees: { $ne: req.session.userId },
                date: { $gte: new Date() }
            }).limit(3);
        } else {
            recommendedEvents = await Event.find({
                category: { $in: ['General'] },
                date: { $gte: new Date() }
            }).limit(3);
        }
        
        res.render("event-view", {
            events, success, role, myEvents, page, totalPages,
            userId: req.session.userId,
            categories,
            selectedCategories: category || "all",
            selectedSort: sort,
            recommendedEvents,
            selectedSearch: search
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// RSVP 
exports.rsvpEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (event.attendees && event.attendees.includes(req.session.userId)) {
            return res.redirect("/events"); // To prevent duplicate RSVP 
        }

        if (event.date < new Date()) {
            return res.redirect("/events"); // Prevent RSVP for past events
        }
        

        if (event.maxAttendees &&
            event.attendees.length >= event.maxAttendees) {
            return res.redirect("/events?error=full");
        }

        await Event.findByIdAndUpdate(req.params.id, { // Object that holds URL route parameters
            $addToSet: { attendees: req.session.userId } // $addToSet is a MongoDB operator. Only adds a value to an array if it doesn't exist so unique to users (like sets)
        });

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

exports.createEventPage = (req, res) => {
    try {
        res.render("create-event", {
            title: "",
            description: "",
            date: "",
            location: "",
            category: [],
            maxAttendees: ""
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
    let maxAttendees = req.body.maxAttendees || undefined
    let category = req.body.category || [];

    if (typeof (category) === 'string') {
        category = [category];
    };

    // To ensure all the fields are present, else, render them back to the same link + error shown
    if (!title || category.length === 0 || !description || !location || !date) {
        return res.render("create-event", {
            error: "All fields are required",
            title, category, description, location, date, maxAttendees
        });
    };

    if (new Date(date) < new Date()) {
        return res.render("create-event", {
            error: "Event date cannot be in the past.",
            title, category, description, location, date, maxAttendees // Admin OR Organisers cannot create events in the past.
        });
    };
    

    try {
        const newEvent = {
            title: title,
            description: description,
            date: date,
            location: location,
            category: category,
            maxAttendees: maxAttendees,
            organiser: req.session.userId
        };

        let result = await Event.create(newEvent);
        console.log("My Log:", result);

        res.redirect("/events?success=true")
    } catch (err) {
        console.error("Database error:", err);
        res.render("create-event", {
            error: "An error occured while saving to database",
            title, category, description, location, date, maxAttendees
        });
    };

};

// Update Event (Have a button visible to admins only to allow them to UPDATE an event)
exports.updateEventPage = async (req, res) => {
    try {
        let targetId = req.query.eventId; // need to get from events viewing page when use click the specific event
        // No eventId — show list of selectable events
        if (!targetId) {
            let myEvents;
            if (req.session.role === 'admin') {
                myEvents = await Event.find();
            } else {
                myEvents = await Event.find({ organiser: req.session.userId });
            }
            return res.render("select-event", { events: myEvents, action: "update" });
        }

        let eventToEdit = await Event.findById(targetId)

        // Conversion of "datetime-local" to a format that is compatible with HTML
        const sgtOffset = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
        const sgtDate = new Date(eventToEdit.date.getTime() + sgtOffset); // getTime() returns milliseconds --> need add 8 hrs as toISOString() always return UTC Time
        let formattedDateForHTML = sgtDate.toISOString().slice(0, 16); // slice away the seconds + ISOString() --> converts JS Date object into standardised string format, needed to allow HTML to recognise the data
        res.render("update-event", {
            targetId,
            title: eventToEdit.title,
            description: eventToEdit.description,
            date: formattedDateForHTML,
            location: eventToEdit.location,
            category: eventToEdit.category,
            maxAttendees: eventToEdit.maxAttendees
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
        const event = await Event.findById(targetId);

                // Allow if admin OR if the organiser owns this event
        if (req.session.role !== 'admin' && event.organiser.toString() !== req.session.userId) {
            return res.send("Unauthorized: You can only modify your own events.");
        }
        
        let description = req.body.description;
        let date = req.body.date;
        let location = req.body.location;
        let maxAttendees = req.body.maxAttendees || undefined
        let category = req.body.category || [];

        if (typeof (category) === 'string') {
            category = [category];
        };

        if (!title || !description || !date || !location || category.length === 0) {
            return res.render("update-event", {
                error: "All fields are required",
                targetId, title, description, date, location, category, maxAttendees
            });
        }



        const updatedEvent = await Event.findByIdAndUpdate(
            targetId,
            { title, description, date, location, maxAttendees, category }
        )
        res.redirect('/events?success=true') // ? is a query string and success = true is used to display message whether the update is confirmed under events page
    } catch (err) {
        console.error("Error saving the update:", err)
        res.send("Error occurred while trying to update the event.")
    }
}

// Delete Event (Have a button visible to admins only to allow them to DELETE an event)

exports.renderDeletePage = async (req, res) => {
    try {
        let allEvents = await Event.find();
        if (req.session.role === 'admin') {
            allEvents = await Event.find();
        } else {
            allEvents = await Event.find({ organiser: req.session.userId });
        }
        res.render("delete-events", { events: allEvents });
        } catch (err) {
            console.log(err)
            res.send("An error occurred while trying to delete the event(s).")
        }
}

exports.deleteEvent = async (req, res) => {
    try {
        let deleteEvent = req.body.deleteEventIds;
        if (!deleteEvent) {
            let allEvents = await Event.find();
            if (req.session.role === 'admin') {
                allEvents = await Event.find();
            } else {
                allEvents = await Event.find({ organiser: req.session.userId });
            }
            return res.render("delete-events", {
                events: allEvents,
                error: "Please select at least one event to delete."
            });
        }

        if (typeof (deleteEvent) === "string") {
            deleteEvent = [deleteEvent];
        };

        if (req.session.role !== 'admin') {
            const events = await Event.find({ _id: { $in: deleteEvent } });
            for (let e of events) {
                if (e.organiser.toString() !== req.session.userId) {
                    return res.send("Unauthorized: You can only delete your own events.");
                }
            }
        }
        
        await Event.deleteMany({ _id: { $in: deleteEvent } }); // $in in MongoDB operator means match any value in this array

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
            .populate('reviews')
            .populate("attendees", "name")

        if (!event) return res.send("Event not found.");

        res.render("event-details", {
            event,
            role: req.session.role,
            userId: req.session.userId  // 👈 add this
        });
    } catch (err) {
        console.error(err);
        res.send("Error loading event details.");
    }
};





