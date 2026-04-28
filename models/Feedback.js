const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  type: {
    type: String,
    enum: ['cafe', 'gym', 'general'],
    default: 'cafe'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  response: {
    type: String,
    default: ''
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isVisible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

feedbackSchema.index({ customer: 1 });
feedbackSchema.index({ type: 1, rating: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
