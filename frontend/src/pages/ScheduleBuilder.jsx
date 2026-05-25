import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { ArrowUp, ArrowDown, Trash2, Plus, Clock, Tag, Sparkles, ArrowRight } from 'lucide-react';

const DAYS = [
  { key: 'monday', label: 'MON' },
  { key: 'tuesday', label: 'TUE' },
  { key: 'wednesday', label: 'WED' },
  { key: 'thursday', label: 'THU' },
  { key: 'friday', label: 'FRI' },
  { key: 'saturday', label: 'SAT' },
  { key: 'sunday', label: 'SUN' }
];

const COLORS = [
  '#00e5a0', // Cyan Green
  '#3b82f6', // Bright Blue
  '#a855f7', // Electric Purple
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#ec4899'  // Pink
];

const getCurrentDayKey = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
  return days[dayIndex];
};

const ScheduleBuilder = () => {
  const [selectedDay, setSelectedDay] = useState(getCurrentDayKey());
  const [template, setTemplate] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form State
  const [label, setLabel] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState(''); // Keep blank by default
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  // Fetch full template on mount
  useEffect(() => {
    fetchTemplate();
  }, []);

  // Update visible blocks when template or selectedDay changes
  useEffect(() => {
    if (template) {
      setBlocks(template[selectedDay] || []);
      
      // Auto-set the next block's start time based on the last block's end time (+ 5 minutes) if blocks exist
      const dayBlocks = template[selectedDay] || [];
      if (dayBlocks.length > 0) {
        const lastBlock = dayBlocks[dayBlocks.length - 1];
        setStartTime(advanceTime(lastBlock.end, 5));
      } else {
        setStartTime('09:00'); // First task of the day defaults to 9 AM!
      }
      setEndTime(''); // Keep end time blank
    }
  }, [template, selectedDay]);

  const fetchTemplate = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/template');
      setTemplate(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching template:', err);
      setError('Could not load weekly schedule template');
    } finally {
      setLoading(false);
    }
  };

  // Helper to add minutes to "HH:MM" string
  const advanceTime = (timeStr, minutesToAdd) => {
    try {
      const [hours, mins] = timeStr.split(':').map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(mins + minutesToAdd);
      
      const newHours = String(date.getHours()).padStart(2, '0');
      const newMins = String(date.getMinutes()).padStart(2, '0');
      return `${newHours}:${newMins}`;
    } catch (e) {
      return '';
    }
  };

  // Replace whole day's blocks
  const updateDayBlocks = async (newBlocks) => {
    try {
      const response = await api.put(`/api/template/${selectedDay}`, { blocks: newBlocks });
      setTemplate(response.data);
      setError('');
      return true;
    } catch (err) {
      console.error('Error saving day blocks:', err);
      setError('Could not update your schedule blocks.');
      return false;
    }
  };

  const handleAddBlock = async (e) => {
    e.preventDefault();
    setError('');

    if (!label || !startTime || !endTime) {
      setError('Please fill in all details including start and end times');
      return;
    }

    if (startTime >= endTime) {
      setError('End time must be after the start time.');
      return;
    }

    const newBlock = {
      blockId: `block_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      label,
      start: startTime,
      end: endTime,
      color: selectedColor
    };

    const updated = [...blocks, newBlock];
    const success = await updateDayBlocks(updated);
    
    if (success) {
      // Clear form inputs
      setLabel('');
      // Keep next start time advanced
      setStartTime(advanceTime(endTime, 5));
      setEndTime(''); // Keep blank
    }
  };

  const handleDeleteBlock = async (blockId) => {
    const updated = blocks.filter(b => b.blockId !== blockId);
    await updateDayBlocks(updated);
  };

  const handleMoveUp = async (index) => {
    if (index === 0) return;
    const updated = [...blocks];
    // Swap items
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    await updateDayBlocks(updated);
  };

  const handleMoveDown = async (index) => {
    if (index === blocks.length - 1) return;
    const updated = [...blocks];
    // Swap items
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    await updateDayBlocks(updated);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#00e5a0]/10 rounded-2xl">
            <Sparkles className="w-6 h-6 text-[#00e5a0]" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-[#e2e8f0]">
              Schedule Builder
            </h1>
            <p className="text-sm text-slate-500 dark:text-[#64748b]">
              Design your custom weekly template. Daily snapshots will load from this design.
            </p>
          </div>
        </div>

        <Link
          to="/dashboard"
          className="flex items-center justify-center px-6 py-3 rounded-2xl bg-[#00e5a0] hover:bg-[#00c98c] text-black font-extrabold text-sm shadow-md hover:shadow-lg transition-all duration-200 w-fit"
        >
          Done Setup? Go to Dashboard
          <ArrowRight className="w-4 h-4 ml-2 stroke-[3]" />
        </Link>
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-[#ff6b35] p-4 rounded-2xl mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Day Tabs Selector */}
      <div className="flex border-b border-slate-200 dark:border-[#1e2530] mb-8 overflow-x-auto pb-1 gap-2">
        {DAYS.map((day) => (
          <button
            key={day.key}
            onClick={() => setSelectedDay(day.key)}
            className={`px-6 py-3 rounded-2xl text-sm font-extrabold tracking-wider transition-all duration-200 whitespace-nowrap ${
              selectedDay === day.key
                ? 'bg-[#00e5a0] text-black shadow-md'
                : 'bg-slate-100 dark:bg-[#161b24] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#1e2530] hover:bg-slate-200 dark:hover:bg-[#1e2530]'
            }`}
          >
            {day.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00e5a0]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Blocks List Column */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-slate-700 dark:text-[#e2e8f0]">
              Active Blocks for <span className="capitalize text-[#00e5a0]">{selectedDay}</span>
            </h3>

            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 dark:border-[#1e2530] rounded-3xl p-6 bg-white dark:bg-[#161b24] text-center">
                <Clock className="w-12 h-12 text-slate-300 dark:text-[#1e2530] mb-3" />
                <p className="text-base text-slate-500 dark:text-[#64748b]">No blocks set for this day.</p>
                <p className="text-xs text-slate-400 dark:text-[#64748b] mt-1">Use the builder form on the right to add your study periods!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {blocks.map((block, index) => (
                  <div
                    key={block.blockId}
                    className="flex items-center justify-between p-4 bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-2xl shadow-sm hover:translate-x-1 hover:border-[#00e5a0]/30 transition-all duration-200"
                  >
                    {/* Block Info */}
                    <div className="flex items-center space-x-4">
                      {/* Left color bar */}
                      <div
                        className="w-2.5 h-12 rounded-full"
                        style={{ backgroundColor: block.color }}
                      />
                      <div>
                        <h4 className="font-extrabold text-slate-800 dark:text-[#e2e8f0]">
                          {block.label}
                        </h4>
                        <p className="text-xs font-semibold text-slate-500 dark:text-[#64748b] flex items-center mt-0.5">
                          <Clock className="w-3.5 h-3.5 mr-1 text-[#00e5a0]" />
                          {block.start} — {block.end}
                        </p>
                      </div>
                    </div>

                    {/* Sorting & Deletion Controls */}
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1e2530] hover:text-[#00e5a0] disabled:opacity-30 disabled:hover:text-slate-400"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === blocks.length - 1}
                        className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1e2530] hover:text-[#00e5a0] disabled:opacity-30 disabled:hover:text-slate-400"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBlock(block.blockId)}
                        className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-[#ff6b35] transition-colors"
                        title="Delete Block"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Block Form Column */}
          <div className="bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl p-6 shadow-sm h-fit">
            <h3 className="text-lg font-bold text-slate-800 dark:text-[#e2e8f0] mb-5 flex items-center">
              <Plus className="w-5 h-5 mr-1.5 text-[#00e5a0]" />
              Add Time Block
            </h3>

            <form onSubmit={handleAddBlock} className="space-y-4">
              {/* Label */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-[#64748b] uppercase tracking-wider mb-2">
                  Block Title / Subject
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-[#64748b]">
                    <Tag className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#0a0c10] border border-slate-200 dark:border-[#1e2530] rounded-2xl text-slate-800 dark:text-[#e2e8f0] focus:ring-2 focus:ring-[#00e5a0] outline-none"
                    placeholder="e.g. Algorithms Practice"
                    required
                  />
                </div>
              </div>

              {/* Start & End Times */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-[#64748b] uppercase tracking-wider mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0a0c10] border border-slate-200 dark:border-[#1e2530] rounded-2xl text-slate-800 dark:text-[#e2e8f0] focus:ring-2 focus:ring-[#00e5a0] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-[#64748b] uppercase tracking-wider mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0a0c10] border border-slate-200 dark:border-[#1e2530] rounded-2xl text-slate-800 dark:text-[#e2e8f0] focus:ring-2 focus:ring-[#00e5a0] outline-none"
                    required
                  />
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-[#64748b] uppercase tracking-wider mb-3">
                  Select Theme Color
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform duration-150 relative ${
                        selectedColor === color
                          ? 'scale-110 border-white dark:border-[#0a0c10] shadow-md'
                          : 'border-transparent opacity-85 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && (
                        <span className="absolute inset-0 m-auto w-2 h-2 bg-white rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Button */}
              <button
                type="submit"
                className="w-full py-3.5 mt-2 rounded-2xl bg-[#00e5a0] hover:bg-[#00c98c] text-black font-extrabold text-sm shadow-md transition-all duration-150 flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2 stroke-[3]" />
                Add to {selectedDay}
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
};

export default ScheduleBuilder;
