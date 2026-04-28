const Inventory = require('../../models/Inventory');
const { createNotification } = require('../../utils/notificationHelper');
const User = require('../../models/User');

exports.getAllInventory = async (req, res) => {
  try {
    const { category, lowStock, search } = req.query;
    const query = {};
    if (category) query.category = category;
    if (lowStock === 'true') query.isLowStock = true;
    if (search) query.$text = { $search: search };
    const items = await Inventory.find(query).sort({ itemName: 1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Inventory item not found' });
    if (item.isLowStock) {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await createNotification({
          user: admin._id,
          title: 'Low Stock Alert',
          message: `${item.itemName} is running low (${item.quantity} ${item.unit} remaining).`,
          type: 'low_stock',
          relatedId: item._id,
          relatedModel: 'Inventory',
          priority: 'high'
        });
      }
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.restockItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Inventory item not found' });
    item.quantity += quantity;
    item.lastRestocked = new Date();
    await item.save();
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Inventory item not found' });
    res.json({ success: true, message: 'Inventory item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
