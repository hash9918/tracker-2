const mongoose = require('mongoose');

const BlockSchema = new mongoose.Schema({
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
    type: String, // "09:00"
    required: true,
  },
  end: {
    type: String, // "12:00"
    required: true,
  },
  color: {
    type: String, // hex e.g., "#00e5a0"
    required: true,
  },
});

const ScheduleTemplateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    monday: [BlockSchema],
    tuesday: [BlockSchema],
    wednesday: [BlockSchema],
    thursday: [BlockSchema],
    friday: [BlockSchema],
    saturday: [BlockSchema],
    sunday: [BlockSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ScheduleTemplate', ScheduleTemplateSchema);
