const express = require('express');
const router = express.Router();
const { getDashboard, getSalesReport } = require('../controllers/admin/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('admin'), getDashboard);
router.get('/reports/sales', protect, authorize('admin'), getSalesReport);

module.exports = router;
