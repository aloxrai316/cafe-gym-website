const mongoose = require('mongoose');

const waiterCallSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'resolved'],
    default: 'pending'
  },
  message: {
    type: String,
    default: 'Customer needs assistance'
  }
}, {
  timestamps: true
});

waiterCallSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('WaiterCall', waiterCallSchema);
