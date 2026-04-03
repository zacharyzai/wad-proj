const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Event description is required']
    },
    date: {
        type: Date,
        required: [true, 'Event date is required']
    },
    location: {
        type: String,
        required: [true, 'Location is required']
    },
    category: [{
        type: String,
        enum: ['General', 'Sports', 'Festivals', 'Hackathons', 'Discussions', 'Networking', 'Others'], 
    }],
    maxAttendees : {
        type: Number,
        min: 1,
        validate: {
            validator: Number.isInteger,
            message: "Enter a valid number"
        }
    },
    organiser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
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

