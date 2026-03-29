const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    // Field 1: The name of the event
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true
    },
    // Field 2: What the event is about (e.g., "Join us for a sprint training session!")
    description: {
        type: String,
        required: [true, 'Event description is required']
    },
    // Field 3: When it happens
    date: {
        type: Date,
        required: [true, 'Event date is required']
    },
    // Field 4: Where it happens
    location: {
        type: String,
        required: [true, 'Location is required']
    },
    // Field 5: Type of event (e.g., Sports, Food, Tech)
    category: [{
        type: String,
        enum: ['General', 'Sports', 'Festivals', 'Hackathons', 'Discussions', 'Networking', 'Others'], // enum is used to tell Mongoose to only accept these specific values
    }],
    // Field 6, Max Attendees
    maxAttendees : {
        type: Number,
        min: 1,
        validate: {
            validator: Number.isInteger,
            message: "Enter a valid number"
        }
    },
    // Field 7: The user who created the event (Links to User schema)
    organiser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Field 8: Array of users attending (Links to User schema for RSVPs)
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema, 'events');
const Event = mongoose.model('Event', eventSchema, 'events');


exports.retrieveAll = function() {
    return Event.find();
};

exports.findById = function(id) {
    return Event.findById(id);
};

exports.addEvent = function(newEvent) {
    return Event.create(newEvent);
};

exports.updateEvent = function(id, updatedData) {
    return Event.updateOne({ id: id }, updatedData);
};

exports.deleteEvent = function(id) {
    return Event.deleteOne({ id: id });
};