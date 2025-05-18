import Notification from '../models/Notification.js';
import asyncHandler from '../middleware/asyncHandler.middleware.js';

export const createNotification = asyncHandler(async (req, res) => {
  const { userId, message, read } = req.body;
  const newNotification = new Notification({
    userId: userId, 
    message: message,
    read: read || false,
  });
  await newNotification.save();
  res.status(201).json({ type: 'OK', message: 'Notification created successfully' });
});
export const getNotificationsForUser = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json({ type: 'OK', notifications: notifications });
});
// Other potential controller functions (update, delete, etc.) can be added here following the same pattern