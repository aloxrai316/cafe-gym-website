const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['food_items', 'beverages', 'coffee', 'liquors'],
  },
  image: {
    type: String,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number,
    default: 15,
    min: 0
  }
}, {
  timestamps: true
});

menuItemSchema.index({ category: 1, isAvailable: 1 });
menuItemSchema.index({ name: 'text' });

module.exports = mongoose.model('MenuItem', menuItemSchema);
