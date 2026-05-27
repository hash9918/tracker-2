const express = require('express');
const router = express.Router();
const DayLog = require('../models/DayLog');
const ScheduleTemplate = require('../models/ScheduleTemplate');
const { protect } = require('../middleware/auth');

// Helper to determine day name from YYYY-MM-DD without timezone offset issues
const getDayName = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
};

// @route   GET /api/daylog/:date
// @desc    Get day log for a specific date (YYYY-MM-DD). If it doesn't exist, create it from template
// @access  Private
router.get('/:date', protect, async (req, res) => {
  const dateStr = req.params.date; // Format "YYYY-MM-DD"
  const userId = req.user._id;

  try {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Check if a day log already exists
    let log = await DayLog.findOne({ user: userId, date: dateStr });
    
    // Determine the day of the week
    const dayOfWeek = getDayName(dateStr);

    // Fetch the user's schedule template
    const template = await ScheduleTemplate.findOne({ user: userId });
    
    // Copy the blocks from template for the specific day of week
    let templateBlocks = [];
    if (template) {
      templateBlocks = template[dayOfWeek] || [];
    }

    if (log) {
      // IF the log already exists in the database but has 0 blocks (e.g. created before template setup),
      // and the template now has blocks, automatically populate it!
      if (log.blocks.length === 0 && templateBlocks.length > 0) {
        log.blocks = templateBlocks.map((block) => ({
          blockId: block.blockId,
          label: block.label,
          start: block.start,
          end: block.end,
          color: block.color,
          completed: false,
        }));
        log.completionPercent = 0;
        log.checkedIn = false;
        await log.save();
      }
      return res.json(log);
    }

    // Map template blocks to day log blocks
    const dayBlocks = templateBlocks.map((block) => ({
      blockId: block.blockId,
      label: block.label,
      start: block.start,
      end: block.end,
      color: block.color,
      completed: false,
    }));

    // Create the new day log
    log = await DayLog.create({
      user: userId,
      date: dateStr,
      dayOfWeek,
      blocks: dayBlocks,
      completionPercent: 0,
      checkedIn: false,
    });

    res.status(201).json(log);
  } catch (error) {
    console.error(`Error fetching/creating day log for ${dateStr}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/daylog/:date/sync
// @desc    Force sync today's day log with the current schedule template (overwrites today's log blocks)
// @access  Private
router.post('/:date/sync', protect, async (req, res) => {
  const dateStr = req.params.date;
  const userId = req.user._id;

  try {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const dayOfWeek = getDayName(dateStr);
    const template = await ScheduleTemplate.findOne({ user: userId });
    
    let templateBlocks = [];
    if (template) {
      templateBlocks = template[dayOfWeek] || [];
    }

    let log = await DayLog.findOne({ user: userId, date: dateStr });

    // Map existing block completion states to keep user progress
    const existingCompletedMap = new Map();
    if (log) {
      log.blocks.forEach((block) => {
        existingCompletedMap.set(block.blockId, block.completed);
      });
    }

    const dayBlocks = templateBlocks.map((block) => ({
      blockId: block.blockId,
      label: block.label,
      start: block.start,
      end: block.end,
      color: block.color,
      completed: existingCompletedMap.get(block.blockId) || false,
    }));

    // Re-calculate completion statistics
    const totalBlocks = dayBlocks.length;
    const completedBlocks = dayBlocks.filter(b => b.completed).length;
    const completionPercent = totalBlocks > 0 
      ? Math.round((completedBlocks / totalBlocks) * 100) 
      : 0;
    const checkedIn = completedBlocks > 0;

    if (log) {
      log.blocks = dayBlocks;
      log.completionPercent = completionPercent;
      log.checkedIn = checkedIn;
      await log.save();
    } else {
      log = await DayLog.create({
        user: userId,
        date: dateStr,
        dayOfWeek,
        blocks: dayBlocks,
        completionPercent,
        checkedIn,
      });
    }

    res.json(log);
  } catch (error) {
    console.error(`Error syncing day log for ${dateStr}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/daylog/:date/block/:blockId
// @desc    Toggle or set completed status for a block
// @access  Private
router.patch('/:date/block/:blockId', protect, async (req, res) => {
  const dateStr = req.params.date;
  const blockId = req.params.blockId;
  const { completed } = req.body;
  const userId = req.user._id;

  try {
    if (completed === undefined) {
      return res.status(400).json({ message: 'completed status is required in body' });
    }

    const log = await DayLog.findOne({ user: userId, date: dateStr });
    if (!log) {
      return res.status(404).json({ message: 'Day log not found' });
    }

    // Find and update the block in blocks array
    const blockIndex = log.blocks.findIndex(b => b.blockId === blockId);
    if (blockIndex === -1) {
      return res.status(404).json({ message: 'Block not found in this day log' });
    }

    log.blocks[blockIndex].completed = completed;

    // Recalculate completionPercent and checkedIn
    const totalBlocks = log.blocks.length;
    const completedBlocks = log.blocks.filter(b => b.completed).length;

    log.completionPercent = totalBlocks > 0 
      ? Math.round((completedBlocks / totalBlocks) * 100) 
      : 0;

    log.checkedIn = completedBlocks > 0;

    await log.save();
    res.json(log);
  } catch (error) {
    console.error(`Error patching block ${blockId} in log ${dateStr}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/daylog/:date/review
// @desc    Update mood, productivity score, and reflection note for a date
// @access  Private
router.patch('/:date/review', protect, async (req, res) => {
  const dateStr = req.params.date;
  const { mood, productivityScore, reflectionNote } = req.body;
  const userId = req.user._id;

  try {
    // 1. Reject invalid dates early
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // 2. Validate mood
    if (mood !== undefined && !['focused', 'okay', 'tired', 'stressed', 'energetic', ''].includes(mood)) {
      return res.status(400).json({ message: 'Invalid mood selection' });
    }

    // 3. Validate productivity score
    if (productivityScore !== undefined && productivityScore !== null) {
      const score = Number(productivityScore);
      if (isNaN(score) || score < 1 || score > 10) {
        return res.status(400).json({ message: 'Productivity score must be between 1 and 10' });
      }
    }

    const log = await DayLog.findOne({ user: userId, date: dateStr });
    if (!log) {
      return res.status(404).json({ message: 'Day log not found' });
    }

    if (mood !== undefined) log.mood = mood;
    if (productivityScore !== undefined) log.productivityScore = productivityScore;
    if (reflectionNote !== undefined) log.reflectionNote = reflectionNote;

    await log.save();
    res.json(log);
  } catch (error) {
    console.error(`Error saving review for ${dateStr}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/daylog/review/weekly
// @desc    Get weekly review analytics & insights
// @access  Private
router.get('/review/weekly', protect, async (req, res) => {
  const startDateStr = req.query.startDate;
  const userId = req.user._id;

  try {
    if (!startDateStr || !/^\d{4}-\d{2}-\d{2}$/.test(startDateStr)) {
      return res.status(400).json({ message: 'Invalid startDate. Use YYYY-MM-DD' });
    }

    // Generate local 7-day date window
    const dates = [];
    const [year, month, day] = startDateStr.split('-').map(Number);
    for (let i = 0; i < 7; i++) {
      const d = new Date(year, month - 1, day + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayVal = String(d.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${dayVal}`);
    }

    const logs = await DayLog.find({ user: userId, date: { $in: dates } });

    // 1. Calculate Completed Tasks & Focus Hours
    let completedTasks = 0;
    let focusMinutes = 0;
    logs.forEach(log => {
      log.blocks.forEach(block => {
        if (block.completed) {
          completedTasks++;
          try {
            const [sHour, sMin] = block.start.split(':').map(Number);
            const [eHour, eMin] = block.end.split(':').map(Number);
            let diffMin = (eHour * 60 + eMin) - (sHour * 60 + sMin);
            if (diffMin < 0) diffMin += 24 * 60;
            focusMinutes += diffMin;
          } catch (e) {
            // Skip invalid times formats silently
          }
        }
      });
    });
    const focusHours = (focusMinutes / 60).toFixed(1);

    // 2. Best Mood
    const moodCounts = {};
    logs.forEach(log => {
      if (log.mood) {
        moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
      }
    });
    let bestMood = 'Not Logged';
    let maxMoodCount = 0;
    for (const [m, count] of Object.entries(moodCounts)) {
      if (count > maxMoodCount) {
        maxMoodCount = count;
        bestMood = m;
      }
    }

    // 3. Strongest & Weakest Days
    let strongestLog = null;
    let weakestLog = null;

    logs.forEach(log => {
      // Strongest Day Calculation
      if (!strongestLog) {
        strongestLog = log;
      } else if (log.completionPercent > strongestLog.completionPercent) {
        strongestLog = log;
      } else if (log.completionPercent === strongestLog.completionPercent) {
        if ((log.productivityScore || 0) > (strongestLog.productivityScore || 0)) {
          strongestLog = log;
        }
      }

      // Weakest Day Calculation (ignoring completely rest/empty days)
      if (log.blocks.length > 0) {
        if (!weakestLog) {
          weakestLog = log;
        } else if (log.completionPercent < weakestLog.completionPercent) {
          weakestLog = log;
        } else if (log.completionPercent === weakestLog.completionPercent) {
          if ((log.productivityScore || 10) < (weakestLog.productivityScore || 10)) {
            weakestLog = log;
          }
        }
      }
    });

    // 4. Week-bounded Longest Streak
    let currentStreak = 0;
    let longestStreak = 0;
    dates.forEach(dateStr => {
      const log = logs.find(l => l.date === dateStr);
      if (log && log.completionPercent === 100) {
        currentStreak++;
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
      } else if (log && log.blocks.length === 0) {
        // Rest day doesn't break weekly streak
      } else {
        currentStreak = 0;
      }
    });

    // 5. Reflection Highlights
    const reflectionHighlights = logs
      .filter(log => log.reflectionNote && log.reflectionNote.trim() !== '')
      .map(log => ({
        date: log.date,
        dayOfWeek: log.dayOfWeek,
        reflectionNote: log.reflectionNote,
        mood: log.mood,
        productivityScore: log.productivityScore
      }));

    res.json({
      startDate: startDateStr,
      endDate: dates[6],
      completedTasks,
      focusHours,
      bestMood,
      longestStreak,
      strongestDay: strongestLog ? {
        date: strongestLog.date,
        dayOfWeek: strongestLog.dayOfWeek,
        completionPercent: strongestLog.completionPercent,
        productivityScore: strongestLog.productivityScore,
        mood: strongestLog.mood
      } : null,
      weakestDay: weakestLog ? {
        date: weakestLog.date,
        dayOfWeek: weakestLog.dayOfWeek,
        completionPercent: weakestLog.completionPercent,
        productivityScore: weakestLog.productivityScore,
        mood: weakestLog.mood
      } : null,
      reflectionHighlights
    });
  } catch (error) {
    console.error('Error fetching weekly review analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
