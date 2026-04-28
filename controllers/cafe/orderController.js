const Order = require('../../models/Order');
const MenuItem = require('../../models/MenuItem');
const { TAX_RATE } = require('../../config/constants');

// Guest order - no auth required
exports.createGuestOrder = async (req, res) => {
  try {
    const { items, tableNumber, guestName, notes } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item' });
    }
    if (!tableNumber) {
      return res.status(400).json({ success: false, message: 'Table number is required' });
    }

    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      if (item.quantity > 20) {
        return res.status(400).json({ success: false, message: `Maximum 20 units per item allowed` });
      }
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) {
        return res.status(404).json({ success: false, message: `Menu item not found` });
      }
      if (!menuItem.isAvailable) {
        return res.status(400).json({ success: false, message: `${menuItem.name} is currently out of stock` });
      }
      subtotal += menuItem.price * item.quantity;
      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price
      });
    }

    const tax = Math.round(subtotal * TAX_RATE);
    const totalAmount = subtotal + tax;

    const order = await Order.create({
      items: orderItems,
      tableNumber,
      guestName: guestName || 'Guest',
      subtotal,
      tax,
      totalAmount,
      notes
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all orders (admin/kitchen)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      query.createdAt = { $gte: start, $lt: end };
    }
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Order.countDocuments(query);
    res.json({ success: true, data: orders, pagination: { page: parseInt(page), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single order
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update order status (admin/kitchen)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.status = status;
    await order.save();
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get orders by table (for customer tracking)
exports.getOrdersByTable = async (req, res) => {
  try {
    const { tableNumber } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const orders = await Order.find({
      tableNumber: parseInt(tableNumber),
      createdAt: { $gte: today }
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
