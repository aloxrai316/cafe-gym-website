const express = require('express');
const router = express.Router();
const { getAllMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability } = require('../controllers/cafe/menuController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllMenuItems);
router.get('/:id', getMenuItem);
router.post('/', protect, authorize('admin'), createMenuItem);
router.put('/:id', protect, authorize('admin'), updateMenuItem);
router.delete('/:id', protect, authorize('admin'), deleteMenuItem);
router.patch('/:id/toggle', protect, authorize('admin'), toggleAvailability);

module.exports = router;
