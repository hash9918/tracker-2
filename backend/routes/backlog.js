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
  const { title, description, color, tasks } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const formattedTasks = Array.isArray(tasks)
      ? tasks.map((t) => (typeof t === 'string' ? { text: t, completed: false } : t))
      : [];

    const item = await BacklogItem.create({
      user: req.user._id,
      title,
      description,
      color,
      tasks: formattedTasks,
      completed: false,
      completedAt: null,
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
  const { title, description, color, completed, completedAt, tasks } = req.body;

  try {
    let item = await BacklogItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Backlog item not found' });
    }

    // Check ownership
    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;
    if (color !== undefined) item.color = color;
    if (tasks !== undefined && Array.isArray(tasks)) item.tasks = tasks;

    if (completed !== undefined) {
      if (completed && !item.completed) {
        item.completed = true;
        item.completedAt = completedAt || new Date();
      } else if (!completed && item.completed) {
        item.completed = false;
        item.completedAt = null;
      }
    } else if (completedAt !== undefined) {
      item.completedAt = completedAt;
    }

    await item.save();
    res.json(item);
  } catch (error) {
    console.error('Error updating backlog item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/backlog/:id/toggle
// @desc    Toggle vault completed status
// @access  Private
router.patch('/:id/toggle', protect, async (req, res) => {
  try {
    const item = await BacklogItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Backlog item not found' });
    }

    // Check ownership
    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    item.completed = !item.completed;
    if (item.completed) {
      item.completedAt = new Date();
      // Optional: also mark all subtasks as completed if user completed the entire vault
      if (item.tasks && item.tasks.length > 0) {
        item.tasks.forEach((t) => {
          t.completed = true;
          if (!t.completedAt) t.completedAt = new Date();
        });
      }
    } else {
      item.completedAt = null;
    }

    await item.save();
    res.json(item);
  } catch (error) {
    console.error('Error toggling backlog item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/backlog/:id/tasks/:taskIndex/toggle
// @desc    Toggle individual subtask in a vault
// @access  Private
router.patch('/:id/tasks/:taskIndex/toggle', protect, async (req, res) => {
  try {
    const item = await BacklogItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Backlog item not found' });
    }

    // Check ownership
    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const taskIndex = parseInt(req.params.taskIndex, 10);
    if (isNaN(taskIndex) || !item.tasks || !item.tasks[taskIndex]) {
      return res.status(400).json({ message: 'Invalid task index' });
    }

    item.tasks[taskIndex].completed = !item.tasks[taskIndex].completed;
    item.tasks[taskIndex].completedAt = item.tasks[taskIndex].completed ? new Date() : null;

    // Check if all subtasks are completed
    const allCompleted = item.tasks.length > 0 && item.tasks.every((t) => t.completed);
    if (allCompleted && !item.completed) {
      item.completed = true;
      item.completedAt = new Date();
    } else if (!allCompleted && item.completed) {
      // If user unchecks a task from a complete vault
      item.completed = false;
      item.completedAt = null;
    }

    await item.save();
    res.json(item);
  } catch (error) {
    console.error('Error toggling subtask:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/backlog/:id/tasks
// @desc    Add a subtask to an existing vault
// @access  Private
router.post('/:id/tasks', protect, async (req, res) => {
  const { text } = req.body;

  try {
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Task text is required' });
    }

    const item = await BacklogItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Backlog item not found' });
    }

    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    item.tasks.push({
      text: text.trim(),
      completed: false,
      completedAt: null,
    });

    // If it was completed, adding a new task makes it incomplete
    if (item.completed) {
      item.completed = false;
      item.completedAt = null;
    }

    await item.save();
    res.json(item);
  } catch (error) {
    console.error('Error adding subtask:', error);
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
