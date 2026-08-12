import { Notification } from '../Model/Notification.js';

export async function getUserNotifications(req, res) {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
  }
}

export async function markNotificationAsRead(req, res) {
  try {
    const { id } = req.params;
    const notif = await Notification.findById(id);
    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notif.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    notif.isRead = true;
    await notif.save();

    return res.status(200).json({ success: true, notification: notif });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update notification', error: error.message });
  }
}

export async function markAllNotificationsAsRead(req, res) {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });

    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to mark notifications as read', error: error.message });
  }
}
