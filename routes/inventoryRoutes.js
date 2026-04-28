const express = require('express');
const router = express.Router();
const { getAllInventory, createInventoryItem, updateInventoryItem, restockItem, deleteInventoryItem } = require('../controllers/cafe/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getAllInventory);
router.post('/', protect, authorize('admin'), createInventoryItem);
router.put('/:id', protect, authorize('admin'), updateInventoryItem);
router.patch('/:id/restock', protect, authorize('admin'), restockItem);
router.delete('/:id', protect, authorize('admin'), deleteInventoryItem);

module.exports = router;
