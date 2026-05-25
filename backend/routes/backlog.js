const express = require('express');
const router = express.Router();
const BacklogItem = require('../models/BacklogItem');
const { protect } = require('../middleware/auth');

// @route   GET /api/backlog
// @desc    Get all backlog items for user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const items = await BacklogItem.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('Error fetching backlog items:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/backlog
// @desc    Create a new backlog item
// @access  Private
router.post('/', protect, async (req, res) => {
  const { title, description, color } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const item = await BacklogItem.create({
      user: req.user._id,
      title,
      description,
      color,
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating backlog item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/backlog/:id
// @desc    Update a backlog item
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { title, description, color } = req.body;

  try {
    let item = await BacklogItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Backlog item not found' });
    }

    // Check ownership
    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    item.title = title || item.title;
    item.description = description !== undefined ? description : item.description;
    item.color = color || item.color;

    await item.save();
    res.json(item);
  } catch (error) {
    console.error('Error updating backlog item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/backlog/:id
// @desc    Delete a backlog item
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await BacklogItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Backlog item not found' });
    }

    // Check ownership
    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await item.deleteOne();
    res.json({ message: 'Item removed' });
  } catch (error) {
    console.error('Error deleting backlog item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
