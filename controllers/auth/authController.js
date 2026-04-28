const User = require('../../models/User');
const { generateToken, generateRefreshToken } = require('../../utils/generateToken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, address } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const userRole = ['customer'].includes(role) ? role : 'customer';
    const user = await User.create({ name, email, password, phone, role: userRole, address });
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();
    res.status(201).json({
      success: true,
      data: { user, token, refreshToken }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();
    res.json({
      success: true,
      data: { user, token, refreshToken }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    const token = generateToken(user._id);
    res.json({ success: true, data: { token }, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createStaff = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!['kitchen_staff', 'gym_trainer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid staff role' });
    }
    const user = await User.create({ name, email, password, phone, role });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
