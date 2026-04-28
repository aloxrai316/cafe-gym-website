const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GymMember',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  checkIn: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkOut: {
    type: Date
  },
  duration: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

attendanceSchema.pre('save', function(next) {
  if (this.checkIn && this.checkOut) {
    this.duration = Math.round((this.checkOut - this.checkIn) / (1000 * 60));
  }
  next();
});

attendanceSchema.index({ member: 1, checkIn: -1 });
attendanceSchema.index({ user: 1, checkIn: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
