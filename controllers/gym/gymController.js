const GymMember = require('../../models/GymMember');
const Attendance = require('../../models/Attendance');
const User = require('../../models/User');
const { createNotification } = require('../../utils/notificationHelper');
const { MEMBERSHIP_FEES, CARDIO_ADDON_FEE } = require('../../config/constants');

exports.registerMembership = async (req, res) => {
  try {
    const { membershipType, startDate, trainer, emergencyContact, healthInfo } = req.body;
    const existing = await GymMember.findOne({ user: req.user._id, status: 'active' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have an active membership' });
    }
    const start = new Date(startDate || Date.now());
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    const monthlyFee = MEMBERSHIP_FEES[membershipType] || MEMBERSHIP_FEES.basic;
    const cardioFee = membershipType === 'cardio' ? CARDIO_ADDON_FEE : membershipType === 'premium' ? CARDIO_ADDON_FEE : 0;
    const totalFee = monthlyFee + cardioFee;
    const member = await GymMember.create({
      user: req.user._id,
      membershipType: membershipType || 'basic',
      startDate: start,
      endDate: end,
      monthlyFee,
      cardioFee,
      totalFee,
      trainer,
      emergencyContact,
      healthInfo,
      paymentHistory: [{ amount: totalFee, date: new Date(), method: 'pending', status: 'pending' }]
    });
    await createNotification({
      user: req.user._id,
      title: 'Gym Membership Created',
      message: `Your ${membershipType} membership has been created. Monthly fee: Rs. ${totalFee}`,
      type: 'membership_created',
      relatedId: member._id,
      relatedModel: 'GymMember'
    });
    res.status(201).json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyMembership = async (req, res) => {
  try {
    const membership = await GymMember.findOne({ user: req.user._id })
      .populate('trainer', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: membership });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllMembers = async (req, res) => {
  try {
    const { status, membershipType } = req.query;
    const query = {};
    if (status) query.status = status;
    if (membershipType) query.membershipType = membershipType;
    const members = await GymMember.find(query)
      .populate('user', 'name email phone')
      .populate('trainer', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMembership = async (req, res) => {
  try {
    const member = await GymMember.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!member) return res.status(404).json({ success: false, message: 'Membership not found' });
    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.renewMembership = async (req, res) => {
  try {
    const member = await GymMember.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Membership not found' });
    const newEnd = new Date(member.endDate);
    newEnd.setMonth(newEnd.getMonth() + 1);
    member.endDate = newEnd;
    member.status = 'active';
    member.paymentHistory.push({ amount: member.totalFee, date: new Date(), method: 'pending', status: 'pending' });
    await member.save();
    await createNotification({
      user: member.user,
      title: 'Membership Renewed',
      message: `Your gym membership has been renewed until ${newEnd.toLocaleDateString()}.`,
      type: 'membership_created',
      relatedId: member._id,
      relatedModel: 'GymMember'
    });
    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.assignTrainer = async (req, res) => {
  try {
    const { trainerId } = req.body;
    const trainer = await User.findOne({ _id: trainerId, role: 'gym_trainer' });
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });
    const member = await GymMember.findByIdAndUpdate(req.params.id, { trainer: trainerId }, { new: true })
      .populate('trainer', 'name email phone');
    if (!member) return res.status(404).json({ success: false, message: 'Membership not found' });
    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkIn = async (req, res) => {
  try {
    const member = await GymMember.findOne({ user: req.user._id, status: 'active' });
    if (!member) return res.status(400).json({ success: false, message: 'No active membership found' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingCheckIn = await Attendance.findOne({
      member: member._id,
      checkIn: { $gte: today },
      checkOut: null
    });
    if (existingCheckIn) {
      return res.status(400).json({ success: false, message: 'Already checked in today. Please check out first.' });
    }
    const attendance = await Attendance.create({
      member: member._id,
      user: req.user._id,
      checkIn: new Date()
    });
    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const member = await GymMember.findOne({ user: req.user._id });
    if (!member) return res.status(400).json({ success: false, message: 'No membership found' });
    const attendance = await Attendance.findOne({
      member: member._id,
      checkOut: null
    }).sort({ checkIn: -1 });
    if (!attendance) return res.status(400).json({ success: false, message: 'No active check-in found' });
    attendance.checkOut = new Date();
    await attendance.save();
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    const member = await GymMember.findOne({ user: req.user._id });
    if (!member) return res.status(404).json({ success: false, message: 'No membership found' });
    const attendance = await Attendance.find({ member: member._id })
      .sort({ checkIn: -1 })
      .limit(30);
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const { date, memberId } = req.query;
    const query = {};
    if (memberId) query.member = memberId;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      query.checkIn = { $gte: start, $lt: end };
    }
    const attendance = await Attendance.find(query)
      .populate({ path: 'member', populate: { path: 'user', select: 'name email' } })
      .sort({ checkIn: -1 });
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTrainerMembers = async (req, res) => {
  try {
    const members = await GymMember.find({ trainer: req.user._id, status: 'active' })
      .populate('user', 'name email phone');
    res.json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
