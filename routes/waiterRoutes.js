const express = require('express');
const router = express.Router();
const { callWaiter, getActiveCalls, acknowledgeCall, resolveCall } = require('../controllers/cafe/waiterController');
const { protect, authorize } = require('../middleware/auth');

// Public - customer can call waiter without login
router.post('/call', callWaiter);

// Admin/Staff
router.get('/active', protect, authorize('admin', 'kitchen_staff'), getActiveCalls);
router.patch('/:id/acknowledge', protect, authorize('admin', 'kitchen_staff'), acknowledgeCall);
router.patch('/:id/resolve', protect, authorize('admin', 'kitchen_staff'), resolveCall);

module.exports = router;
