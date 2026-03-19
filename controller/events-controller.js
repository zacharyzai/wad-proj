const Event = require("../models/event-models");


// Read (user sees all the available events on a particular date)




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
            organiser: "65f1a2b3c4d5e6f7a8b9c0d1" // temporary hardcoded ID for testing. once login ready swap to req.user._id, || check on this, assign admin as organiser
        };

        let result = await Event.addEvents(newEvent);
        console.log("My Log:", result);

        res.redirect("/events/create-event")

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

        res.render("update-event", {
            targetId,
            title: eventToEdit.title,
            description: eventToEdit.description,
            date: eventToEdit.date,
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
        let date = req.body.date; // need to update date such that is is day/month/year (can do 1/1/2001) time can put AM/PM style? or 24h idk
        let location = req.body.location;
        let category = req.body.category;

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

        await Event.deleteMany({ _id : { $in: deleteEvent}});

        res.redirect("/events?success=true");
    } catch (err) {
        console.log(err)
        res.send("An error occurred while trying to delete the event(s).")
    }
}


