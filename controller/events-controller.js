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
            organiser: req.user._id // check on this, assign admin as organiser
        };

        let result = await Event.addEvents(newEvent);
        console.log("My Log:", result);

        res.redirect("/events")

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
        let targetId = req.query.eventid; // need to get from events viewing page when use click the specific event
        let title = req.query.title;
        let description = req.query.description;
        let date = req.query.date;
        let location = req.query.location;
        let category = req.query.category;
        let organiser = req.query.organiser;

        res.render("/events-update", {
            targetId,
            title,
            description,
            date,
            location,
            category,
            organiser
        })
    } catch (err) {
        console.error("Error:", err);
        res.send("Error updating the event. Please try again.")
    }
}


// Delete Event (Have a button visible to admins only to allow them to DELETE an event) 


