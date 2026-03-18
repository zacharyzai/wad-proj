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
    category: {
        type: String,
        default: 'General'
    },
    // Field 6: The user who created the event (Links to User schema)
    organiser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Field 7: Array of users attending (Links to User schema for RSVPs)
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema, 'events');

// Methods here

exports.addEvents = function(newEvent) {
    return Event.create(newEvent);
};

exports.findById = function(id) {
    return Event.find(id)
};

