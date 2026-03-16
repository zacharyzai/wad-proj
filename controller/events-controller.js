const Event = require("../models/event-models");


// Read (user sees all the available events on a particular date)




// Create Event (Have a button visible to admins only to create an event)

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




// Delete Event (Have a button visible to admins only to allow them to DELETE an event) 


