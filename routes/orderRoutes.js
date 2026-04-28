const express = require('express');
const router = express.Router();
const { createGuestOrder, getAllOrders, getOrder, updateOrderStatus, getOrdersByTable } = require('../controllers/cafe/orderController');
const { protect, authorize } = require('../middleware/auth');

// Public - no auth required
router.post('/guest', createGuestOrder);
router.get('/table/:tableNumber', getOrdersByTable);

// Admin/Staff - auth required
router.get('/', protect, authorize('admin', 'kitchen_staff'), getAllOrders);
router.get('/:id', getOrder);
router.patch('/:id/status', protect, authorize('admin', 'kitchen_staff'), updateOrderStatus);

module.exports = router;
