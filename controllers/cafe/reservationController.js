const Reservation = require('../../models/Reservation');
const Table = require('../../models/Table');
const { createNotification } = require('../../utils/notificationHelper');
const { RESERVATION_ADVANCE } = require('../../config/constants');

exports.createReservation = async (req, res) => {
  try {
    const { table, date, startTime, endTime, duration, guestCount, specialRequests } = req.body;
    const tableDoc = await Table.findById(table);
    if (!tableDoc) return res.status(404).json({ success: false, message: 'Table not found' });
    if (guestCount > tableDoc.capacity) {
      return res.status(400).json({ success: false, message: `Table capacity is ${tableDoc.capacity}` });
    }
    const existingReservation = await Reservation.findOne({
      table,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });
    if (existingReservation) {
      return res.status(400).json({ success: false, message: 'Table is already reserved for this time slot' });
    }
    const reservation = await Reservation.create({
      customer: req.user._id,
      table,
      date: new Date(date),
      startTime,
      endTime,
      duration: duration || 2,
      guestCount,
      specialRequests,
      advancePayment: { amount: RESERVATION_ADVANCE, status: 'pending' }
    });
    await createNotification({
      user: req.user._id,
      title: 'Reservation Created',
      message: `Your reservation for Table ${tableDoc.tableNumber} on ${date} at ${startTime} has been created. Please pay Rs. ${RESERVATION_ADVANCE} advance to confirm.`,
      type: 'reservation_confirmed',
      relatedId: reservation._id,
      relatedModel: 'Reservation'
    });
    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ customer: req.user._id })
      .populate('table', 'tableNumber capacity location')
      .sort({ date: -1 });
    res.json({ success: true, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllReservations = async (req, res) => {
  try {
    const { status, date } = req.query;
    const query = {};
    if (status) query.status = status;
    if (date) query.date = new Date(date);
    const reservations = await Reservation.find(query)
      .populate('customer', 'name email phone')
      .populate('table', 'tableNumber capacity location')
      .sort({ date: -1, startTime: 1 });
    res.json({ success: true, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
    reservation.status = status;
    if (status === 'confirmed') {
      await Table.findByIdAndUpdate(reservation.table, { status: 'reserved' });
    } else if (['cancelled', 'completed', 'no_show'].includes(status)) {
      await Table.findByIdAndUpdate(reservation.table, { status: 'available' });
    }
    await reservation.save();
    res.json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({ _id: req.params.id, customer: req.user._id });
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
    if (reservation.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Reservation already cancelled' });
    }
    reservation.status = 'cancelled';
    await reservation.save();
    await Table.findByIdAndUpdate(reservation.table, { status: 'available' });
    await createNotification({
      user: req.user._id,
      title: 'Reservation Cancelled',
      message: 'Your reservation has been cancelled.',
      type: 'reservation_cancelled',
      relatedId: reservation._id,
      relatedModel: 'Reservation'
    });
    res.json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
