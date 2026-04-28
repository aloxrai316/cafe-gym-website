const Table = require('../../models/Table');
const QRCode = require('qrcode');

exports.getAllTables = async (req, res) => {
  try {
    const { status, location } = req.query;
    const query = { isActive: true };
    if (status) query.status = status;
    if (location) query.location = location;
    const tables = await Table.find(query).sort({ tableNumber: 1 });
    res.json({ success: true, data: tables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
    res.json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTable = async (req, res) => {
  try {
    const table = await Table.create(req.body);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const qrData = `${clientUrl}/menu?table=${table.tableNumber}`;
    const qrCode = await QRCode.toDataURL(qrData);
    table.qrCode = qrCode;
    await table.save();
    res.status(201).json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
    res.json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
    res.json({ success: true, message: 'Table deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTableStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const table = await Table.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
    res.json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateQR = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const qrData = `${clientUrl}/menu?table=${table.tableNumber}`;
    const qrCode = await QRCode.toDataURL(qrData);
    table.qrCode = qrCode;
    await table.save();
    res.json({ success: true, data: { qrCode, tableNumber: table.tableNumber } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
