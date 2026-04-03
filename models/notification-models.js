const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days till notifications expire

module.exports = mongoose.model('Notification', notificationSchema);
