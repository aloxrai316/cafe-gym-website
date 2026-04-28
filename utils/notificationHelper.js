const Notification = require('../models/Notification');

const createNotification = async ({ user, title, message, type, relatedId, relatedModel, priority }) => {
  try {
    const notification = await Notification.create({
      user,
      title,
      message,
      type: type || 'general',
      relatedId,
      relatedModel,
      priority: priority || 'medium'
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error.message);
    return null;
  }
};

module.exports = { createNotification };
