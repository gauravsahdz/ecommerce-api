import Notification from '../models/Notification.js';

export const createNotification = async (recipient, type, data) => {
  try {
    const newNotification = new Notification({
      recipient,
      type,
      data,
    });
    await newNotification.save();
    console.log(`Notification created for recipient ${recipient} of type ${type}`);
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};