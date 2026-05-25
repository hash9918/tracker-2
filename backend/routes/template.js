const express = require('express');
const router = express.Router();
const ScheduleTemplate = require('../models/ScheduleTemplate');
const { protect } = require('../middleware/auth');

const VALID_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// @route   GET /api/template
// @desc    Get user weekly schedule template
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let template = await ScheduleTemplate.findOne({ user: req.user._id });
    
    // Fallback: create empty template if somehow it doesn't exist yet
    if (!template) {
      template = await ScheduleTemplate.create({
        user: req.user._id,
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      });
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/template/:day
// @desc    Replace all blocks for a given day in the weekly template
// @access  Private
router.put('/:day', protect, async (req, res) => {
  const day = req.params.day.toLowerCase();
  const { blocks } = req.body;

  try {
    if (!VALID_DAYS.includes(day)) {
      return res.status(400).json({ message: `Invalid day. Must be one of: ${VALID_DAYS.join(', ')}` });
    }

    if (!Array.isArray(blocks)) {
      return res.status(400).json({ message: 'Blocks must be an array' });
    }

    // Find schedule template for the user
    let template = await ScheduleTemplate.findOne({ user: req.user._id });
    if (!template) {
      template = new ScheduleTemplate({ user: req.user._id });
    }

    // Replace the blocks array for the specified day
    template[day] = blocks.map(block => ({
      blockId: block.blockId,
      label: block.label,
      start: block.start,
      end: block.end,
      color: block.color
    }));

    await template.save();
    res.json(template);
  } catch (error) {
    console.error(`Error updating template for ${day}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/template/:day/block/:blockId
// @desc    Delete one specific block from a day
// @access  Private
router.delete('/:day/block/:blockId', protect, async (req, res) => {
  const day = req.params.day.toLowerCase();
  const blockId = req.params.blockId;

  try {
    if (!VALID_DAYS.includes(day)) {
      return res.status(400).json({ message: `Invalid day. Must be one of: ${VALID_DAYS.join(', ')}` });
    }

    let template = await ScheduleTemplate.findOne({ user: req.user._id });
    if (!template) {
      return res.status(404).json({ message: 'Schedule template not found' });
    }

    // Filter out the block with blockId
    template[day] = template[day].filter(block => block.blockId !== blockId);

    await template.save();
    res.json(template);
  } catch (error) {
    console.error(`Error deleting block ${blockId} from ${day}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
