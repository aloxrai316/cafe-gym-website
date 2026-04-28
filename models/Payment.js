const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  reservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation'
  },
  gymMembership: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GymMember'
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'esewa', 'khalti', 'online'],
    required: true
  },
  paymentType: {
    type: String,
    enum: ['full', 'partial', 'advance', 'refund'],
    default: 'full'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'partial'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    default: ''
  },
  paymentFor: {
    type: String,
    enum: ['order', 'reservation', 'gym_membership', 'delivery'],
    required: true
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

paymentSchema.index({ customer: 1, status: 1 });
paymentSchema.index({ paymentFor: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
