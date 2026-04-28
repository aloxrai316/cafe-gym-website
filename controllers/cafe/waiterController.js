const WaiterCall = require('../../models/WaiterCall');

exports.callWaiter = async (req, res) => {
  try {
    const { tableNumber, message } = req.body;
    if (!tableNumber) {
      return res.status(400).json({ success: false, message: 'Table number is required' });
    }
    // Check if there's already a pending call for this table
    const existing = await WaiterCall.findOne({ tableNumber, status: 'pending' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Waiter has already been called for this table' });
    }
    const call = await WaiterCall.create({
      tableNumber,
      message: message || 'Customer needs assistance'
    });
    res.status(201).json({ success: true, data: call });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActiveCalls = async (req, res) => {
  try {
    const calls = await WaiterCall.find({ status: 'pending' }).sort({ createdAt: 1 });
    res.json({ success: true, data: calls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.acknowledgeCall = async (req, res) => {
  try {
    const call = await WaiterCall.findByIdAndUpdate(req.params.id, { status: 'acknowledged' }, { new: true });
    if (!call) return res.status(404).json({ success: false, message: 'Call not found' });
    res.json({ success: true, data: call });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resolveCall = async (req, res) => {
  try {
    const call = await WaiterCall.findByIdAndUpdate(req.params.id, { status: 'resolved' }, { new: true });
    if (!call) return res.status(404).json({ success: false, message: 'Call not found' });
    res.json({ success: true, data: call });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
