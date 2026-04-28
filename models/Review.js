const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  foodRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  serviceRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  guestName: {
    type: String,
    default: 'Guest'
  }
}, {
  timestamps: true
});

reviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
