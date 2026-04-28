const Feedback = require('../../models/Feedback');

exports.createFeedback = async (req, res) => {
  try {
    const { order, type, rating, comment } = req.body;
    const feedback = await Feedback.create({
      customer: req.user._id,
      order,
      type: type || 'cafe',
      rating,
      comment
    });
    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ customer: req.user._id })
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const { type, rating } = req.query;
    const query = {};
    if (type) query.type = type;
    if (rating) query.rating = parseInt(rating);
    const feedback = await Feedback.find(query)
      .populate('customer', 'name email')
      .populate('order', 'orderNumber')
      .populate('respondedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.respondToFeedback = async (req, res) => {
  try {
    const { response } = req.body;
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { response, respondedBy: req.user._id },
      { new: true }
    );
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
