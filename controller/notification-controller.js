const Notification = require('../models/notification-models');

exports.getNotificationsPage = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.session.userId
    }).sort({ createdAt: -1 });

    // mark all unread notifications as read
    await Notification.updateMany(
      { recipient: req.session.userId, isRead: false },
      { isRead: true }
    );

    res.render('user/notifications', { notifications });
  } catch (err) {
    console.error(err);
    res.send('Error loading notifications.');
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.session.userId },
      { isRead: true }
    );
    res.redirect('/notifications');
  } catch (err) {
    console.error(err);
    res.send('Error marking notification as read.');
  }
};
