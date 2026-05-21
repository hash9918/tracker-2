const mongoose = require('mongoose');

const DayBlockSchema = new mongoose.Schema({
  blockId: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
  start: {
    type: String,
    required: true,
  },
  end: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const DayLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
    },
    dayOfWeek: {
      type: String, // "monday", "tuesday", etc.
      required: true,
    },
    blocks: [DayBlockSchema],
    completionPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound unique index on user and date
DayLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DayLog', DayLogSchema);
