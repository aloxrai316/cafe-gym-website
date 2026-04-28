const express = require('express');
const router = express.Router();
const { createPayment, getMyPayments, getAllPayments, processRefund } = require('../controllers/cafe/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createPayment);
router.get('/my', protect, getMyPayments);
router.get('/', protect, authorize('admin'), getAllPayments);
router.patch('/:id/refund', protect, authorize('admin'), processRefund);

module.exports = router;
