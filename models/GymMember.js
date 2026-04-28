const mongoose = require('mongoose');

const gymMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  memberId: {
    type: String,
    unique: true
  },
  membershipType: {
    type: String,
    enum: ['basic', 'cardio', 'premium'],
    default: 'basic'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  monthlyFee: {
    type: Number,
    required: true
  },
  cardioFee: {
    type: Number,
    default: 0
  },
  totalFee: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'suspended', 'cancelled'],
    default: 'active'
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  healthInfo: {
    height: Number,
    weight: Number,
    bloodGroup: String,
    medicalConditions: [String]
  },
  paymentHistory: [{
    amount: Number,
    date: Date,
    method: String,
    transactionId: String,
    status: {
      type: String,
      enum: ['paid', 'pending', 'failed'],
      default: 'paid'
    }
  }],
  isExpiringAlert: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

gymMemberSchema.pre('save', async function(next) {
  if (!this.memberId) {
    const count = await mongoose.model('GymMember').countDocuments();
    this.memberId = `GYM-${String(count + 1).padStart(5, '0')}`;
  }
  const now = new Date();
  const daysUntilExpiry = Math.ceil((this.endDate - now) / (1000 * 60 * 60 * 24));
  this.isExpiringAlert = daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  if (this.endDate < now && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

gymMemberSchema.index({ user: 1 });
gymMemberSchema.index({ status: 1, endDate: 1 });

module.exports = mongoose.model('GymMember', gymMemberSchema);
