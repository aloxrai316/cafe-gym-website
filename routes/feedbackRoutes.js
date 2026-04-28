const express = require('express');
const router = express.Router();
const { createFeedback, getMyFeedback, getAllFeedback, respondToFeedback } = require('../controllers/cafe/feedbackController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createFeedback);
router.get('/my', protect, getMyFeedback);
router.get('/', protect, authorize('admin'), getAllFeedback);
router.patch('/:id/respond', protect, authorize('admin'), respondToFeedback);

module.exports = router;
