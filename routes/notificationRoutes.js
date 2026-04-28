const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead, markAllAsRead } = require('../controllers/cafe/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getMyNotifications);
router.patch('/:id/read', protect, markAsRead);
router.patch('/read-all', protect, markAllAsRead);

module.exports = router;
