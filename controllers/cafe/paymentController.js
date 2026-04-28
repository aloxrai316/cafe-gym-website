const Payment = require('../../models/Payment');
const Order = require('../../models/Order');
const Reservation = require('../../models/Reservation');
const { createNotification } = require('../../utils/notificationHelper');

exports.createPayment = async (req, res) => {
  try {
    const { orderId, reservationId, gymMembershipId, amount, paymentMethod, paymentType, paymentFor, transactionId } = req.body;
    const paymentData = {
      customer: req.user._id,
      amount,
      paymentMethod,
      paymentType: paymentType || 'full',
      paymentFor,
      transactionId: transactionId || `TXN-${Date.now()}`,
      status: 'completed'
    };
    if (orderId) paymentData.order = orderId;
    if (reservationId) paymentData.reservation = reservationId;
    if (gymMembershipId) paymentData.gymMembership = gymMembershipId;
    const payment = await Payment.create(paymentData);
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { 'advancePayment.status': 'paid' });
    }
    if (reservationId) {
      await Reservation.findByIdAndUpdate(reservationId, {
        'advancePayment.status': 'paid',
        'advancePayment.paymentMethod': paymentMethod,
        'advancePayment.transactionId': payment.transactionId,
        status: 'confirmed'
      });
    }
    await createNotification({
      user: req.user._id,
      title: 'Payment Received',
      message: `Payment of Rs. ${amount} received via ${paymentMethod}.`,
      type: 'payment_received',
      relatedId: payment._id,
      relatedModel: 'Payment'
    });
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ customer: req.user._id })
      .populate('order', 'orderNumber totalAmount')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const { status, paymentFor, method, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (paymentFor) query.paymentFor = paymentFor;
    if (method) query.paymentMethod = method;
    const payments = await Payment.find(query)
      .populate('customer', 'name email')
      .populate('order', 'orderNumber totalAmount')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Payment.countDocuments(query);
    res.json({ success: true, data: payments, pagination: { page: parseInt(page), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.processRefund = async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    payment.refundAmount = amount;
    payment.refundReason = reason;
    payment.status = 'refunded';
    await payment.save();
    await createNotification({
      user: payment.customer,
      title: 'Refund Processed',
      message: `Refund of Rs. ${amount} has been processed.`,
      type: 'payment_refund',
      relatedId: payment._id,
      relatedModel: 'Payment'
    });
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
