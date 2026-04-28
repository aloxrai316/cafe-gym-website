const express = require('express');
const router = express.Router();
const { getAllTables, getTable, createTable, updateTable, deleteTable, updateTableStatus, generateQR } = require('../controllers/cafe/tableController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllTables);
router.get('/:id', getTable);
router.post('/', protect, authorize('admin'), createTable);
router.put('/:id', protect, authorize('admin'), updateTable);
router.delete('/:id', protect, authorize('admin'), deleteTable);
router.patch('/:id/status', protect, authorize('admin'), updateTableStatus);
router.get('/:id/qr', protect, authorize('admin'), generateQR);

module.exports = router;
