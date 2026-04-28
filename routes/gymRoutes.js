const express = require('express');
const router = express.Router();
const {
  registerMembership, getMyMembership, getAllMembers, updateMembership, renewMembership,
  assignTrainer, checkIn, checkOut, getMyAttendance, getAllAttendance, getTrainerMembers
} = require('../controllers/gym/gymController');
const { protect, authorize } = require('../middleware/auth');

router.post('/membership', protect, registerMembership);
router.get('/membership/my', protect, getMyMembership);
router.get('/members', protect, authorize('admin', 'gym_trainer'), getAllMembers);
router.put('/membership/:id', protect, authorize('admin'), updateMembership);
router.patch('/membership/:id/renew', protect, authorize('admin'), renewMembership);
router.patch('/membership/:id/trainer', protect, authorize('admin'), assignTrainer);
router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.get('/attendance/my', protect, getMyAttendance);
router.get('/attendance', protect, authorize('admin', 'gym_trainer'), getAllAttendance);
router.get('/trainer/members', protect, authorize('gym_trainer'), getTrainerMembers);

module.exports = router;
