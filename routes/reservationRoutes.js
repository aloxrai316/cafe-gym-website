const express = require('express');
const router = express.Router();
const { createReservation, getMyReservations, getAllReservations, updateReservationStatus, cancelReservation } = require('../controllers/cafe/reservationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createReservation);
router.get('/my', protect, getMyReservations);
router.get('/', protect, authorize('admin'), getAllReservations);
router.patch('/:id/status', protect, authorize('admin'), updateReservationStatus);
router.patch('/:id/cancel', protect, cancelReservation);

module.exports = router;
