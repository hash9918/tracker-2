const express = require('express');
const router = express.Router();
const DayLog = require('../models/DayLog');
const { protect } = require('../middleware/auth');

// Helper to format Date in local timezone
const formatDateLocal = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// @route   GET /api/heatmap
// @desc    Get all day logs for a specific year and compute current streak + total studied days
// @access  Private
router.get('/', protect, async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  const userId = req.user._id;

  try {
    // 1. Fetch all day logs for the specified year
    const startYearStr = `${year}-01-01`;
    const endYearStr = `${year}-12-31`;

    const yearLogs = await DayLog.find({
      user: userId,
      date: { $gte: startYearStr, $lte: endYearStr }
    });

    // Format logs for react-calendar-heatmap: [{ date: 'YYYY-MM-DD', count: completionPercent }]
    const heatmapData = yearLogs.map(log => ({
      date: log.date,
      count: log.completionPercent
    }));

    // 2. Fetch all logs to calculate the streak and total days
    const allLogs = await DayLog.find({ user: userId }).sort({ date: -1 });
    
    // Create map for rapid date lookups
    const logMap = new Map();
    allLogs.forEach(log => {
      logMap.set(log.date, {
        completionPercent: log.completionPercent,
        blockCount: log.blocks.length
      });
    });

    // 3. Smart Streak Calculation (counting backwards)
    let streak = 0;
    let checkDate = new Date(); // Today
    let todayStr = formatDateLocal(checkDate);
    let todayLog = logMap.get(todayStr);

    // If today is not 100% complete, we start checking from yesterday so we don't break the streak mid-day
    if (!todayLog || todayLog.completionPercent < 100) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Traverse backwards
    const maxTraverseDays = 365 * 2; // Limit to 2 years to prevent endless loops
    let daysTraversed = 0;

    while (daysTraversed < maxTraverseDays) {
      const dateStr = formatDateLocal(checkDate);
      const log = logMap.get(dateStr);

      if (log) {
        if (log.blockCount === 0) {
          // Skip day if it has no scheduled blocks (e.g. Sunday or rest day) without breaking the streak
          checkDate.setDate(checkDate.getDate() - 1);
          daysTraversed++;
          continue;
        }

        if (log.completionPercent === 100) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          // Completion is less than 100% - streak is broken
          break;
        }
      } else {
        // No log exists for this date.
        // Let's check what day of the week it is. If it's a Sunday, we can skip it.
        const dayOfWeek = checkDate.getDay(); // 0 is Sunday
        if (dayOfWeek === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          daysTraversed++;
          continue;
        }
        
        // Otherwise, a missing weekday breaks the streak
        break;
      }
      daysTraversed++;
    }

    // 4. Calculate total days studied (where completionPercent > 0)
    const totalDays = allLogs.filter(log => log.completionPercent > 0).length;

    res.json({
      heatmapData,
      streak,
      totalDays
    });
  } catch (error) {
    console.error('Error fetching heatmap stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
