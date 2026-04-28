const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 2,
    min: 1,
    max: 6
  },
  guestCount: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'pending'
  },
  advancePayment: {
    amount: { type: Number, default: 500 },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    paymentMethod: String,
    transactionId: String
  },
  specialRequests: {
    type: String,
    default: ''
  },
  autoCancel: {
    type: Boolean,
    default: true
  },
  autoCancelTime: {
    type: Number,
    default: 30
  }
}, {
  timestamps: true
});

reservationSchema.index({ table: 1, date: 1, startTime: 1 });
reservationSchema.index({ customer: 1, status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
