const Review = require('../../models/Review');

exports.createReview = async (req, res) => {
  try {
    const { tableNumber, orderId, foodRating, serviceRating, comment, guestName } = req.body;
    if (!tableNumber || !foodRating || !serviceRating) {
      return res.status(400).json({ success: false, message: 'Table number and ratings are required' });
    }
    const review = await Review.create({
      tableNumber,
      order: orderId || undefined,
      foodRating,
      serviceRating,
      comment,
      guestName: guestName || 'Guest'
    });
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
