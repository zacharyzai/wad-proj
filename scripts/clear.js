/**
 * Clear script — deletes all documents from every collection in the active DB.
 * Useful for resetting state before re-seeding.
 *
 * Run with: npm run clear
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../config.env') });

const User = require('../models/user-models');
const Event = require('../models/event-models');
const RSVP = require('../models/rsvp-models');
const Review = require('../models/review-models');
const Notification = require('../models/notification-models');

async function clear() {
  await mongoose.connect(process.env.DB);
  console.log(`Connected to database: ${mongoose.connection.db.databaseName}`);

  const results = await Promise.all([
    User.deleteMany({}),
    Event.deleteMany({}),
    RSVP.deleteMany({}),
    Review.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const [users, events, rsvps, reviews, notifications] = results;
  console.log(`Cleared: ${users.deletedCount} users, ${events.deletedCount} events, ${rsvps.deletedCount} rsvps, ${reviews.deletedCount} reviews, ${notifications.deletedCount} notifications`);
  console.log('✓ Database cleared.');

  await mongoose.disconnect();
}

clear().catch((err) => {
  console.error('Clear failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
