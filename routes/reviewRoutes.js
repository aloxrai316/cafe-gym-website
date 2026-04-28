const express = require('express');
const router = express.Router();
const { createReview, getAllReviews } = require('../controllers/cafe/reviewController');
const { protect, authorize } = require('../middleware/auth');

// Public - guest can submit review
router.post('/', createReview);

// Admin
router.get('/', protect, authorize('admin'), getAllReviews);

module.exports = router;
