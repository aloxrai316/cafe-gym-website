const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['ingredient', 'beverage', 'packaging', 'equipment', 'other'],
    default: 'ingredient'
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    enum: ['kg', 'g', 'l', 'ml', 'pcs', 'dozen', 'pack'],
    default: 'pcs'
  },
  minStockLevel: {
    type: Number,
    default: 10
  },
  maxStockLevel: {
    type: Number,
    default: 1000
  },
  costPerUnit: {
    type: Number,
    default: 0,
    min: 0
  },
  supplier: {
    name: String,
    contact: String,
    email: String
  },
  isLowStock: {
    type: Boolean,
    default: false
  },
  lastRestocked: {
    type: Date
  }
}, {
  timestamps: true
});

inventorySchema.pre('save', function(next) {
  this.isLowStock = this.quantity <= this.minStockLevel;
  next();
});

inventorySchema.index({ itemName: 'text' });
inventorySchema.index({ isLowStock: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);
