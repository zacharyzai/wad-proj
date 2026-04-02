const Notification = require('../models/notification-models');

const attachUnreadCount = async (req, res, next) => {
  if (req.session && req.session.userId) {
    res.locals.userRole = req.session.role || null;
    try {
      res.locals.unreadNotifications = await Notification.countDocuments({
        recipient: req.session.userId,
        isRead: false
      });
    } catch (e) {
      res.locals.unreadNotifications = 0;
    }
  } else {
    res.locals.userRole = null;
    res.locals.unreadNotifications = 0;
  }
  next();
};

module.exports = { attachUnreadCount };
