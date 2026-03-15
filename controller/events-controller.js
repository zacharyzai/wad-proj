const Event = require("../models/event-models");

// Read (user sees all the available events on a particular date)




// Create Event (Have a button visible to admins only to create an event)

exports.createEvent = async (req, res) => {
    let title = req.body.title;
    let category = req.body.category;
    let description = req.body.description;
    let location = req.body.location;
    let organiser = req.body.organiser;
}



// Update Event (Have a button visible to admins only to allow them to UPDATE an event)




// Delete Event (Have a button visible to admins only to allow them to DELETE an event) 


