const Order = require('../../models/Order');

exports.getKitchenOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] }
    })
      .populate('customer', 'name')
      .populate('table', 'tableNumber')
      .sort({ createdAt: 1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['preparing', 'ready', 'completed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status for kitchen staff' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
