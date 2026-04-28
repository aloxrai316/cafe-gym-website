const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword, createStaff } = require('../controllers/auth/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/staff', protect, authorize('admin'), createStaff);

module.exports = router;
