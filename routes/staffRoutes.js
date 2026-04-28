const express = require('express');
const router = express.Router();
const { getKitchenOrders, updateOrderStatus } = require('../controllers/staff/kitchenController');
const { protect, authorize } = require('../middleware/auth');

router.get('/kitchen/orders', protect, authorize('kitchen_staff', 'admin'), getKitchenOrders);
router.patch('/kitchen/orders/:id', protect, authorize('kitchen_staff', 'admin'), updateOrderStatus);

module.exports = router;
