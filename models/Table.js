const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'occupied'],
    default: 'available'
  },
  qrCode: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    enum: ['indoor', 'outdoor', 'vip'],
    default: 'indoor'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Table', tableSchema);
