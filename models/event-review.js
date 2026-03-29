const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event"
  },
  user: String,
  comment: String,
  rating: Number
}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);