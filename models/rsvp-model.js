const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Going', 'Maybe', 'Not Going']
    },
    note: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const RSVP = mongoose.model('RSVP', rsvpSchema, 'rsvps');

// Create
exports.addRSVP = function(newRSVP) {
    return RSVP.create(newRSVP);
};

// Read one RSVP by RSVP id
exports.findById = function(id) {
    return RSVP.findById(id).populate('userId').populate('eventId');
};

// Read one RSVP by this user for this event
exports.findByUserAndEvent = function(userId, eventId) {
    return RSVP.findOne({ userId: userId, eventId: eventId });
};

// Read all RSVPs by this user
exports.findAllByUser = function(userId) {
    return RSVP.find({ userId: userId }).populate('eventId');
};

// Update
exports.updateRSVP = function(id, status, note) {
    return RSVP.updateOne(
        { id: id },
        { status: status, note: note }
    );
};

// Delete
exports.deleteRSVP = function(id) {
    return RSVP.deleteOne({ id: id });
};