import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { Calendar, Play, RotateCcw, Clock, Smile, Award, CheckCircle2, XCircle } from 'lucide-react';

const HistoryReplay = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Replay State
  const [replaying, setReplaying] = useState(false);
  const [visibleBlockIds, setVisibleBlockIds] = useState(new Set());

  const getDayName = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatDateLocal = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const handleQuickDate = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayVal = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${dayVal}`);
  };

  const handleLastTuesday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day >= 2 ? 2 : -5);
    const lastTuesday = new Date(d.setDate(diff));
    
    const y = lastTuesday.getFullYear();
    const m = String(lastTuesday.getMonth() + 1).padStart(2, '0');
    const dayVal = String(lastTuesday.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${dayVal}`);
  };

  const fetchLog = async () => {
    setLoading(true);
    setError('');
    setLog(null);
    setVisibleBlockIds(new Set());
    setReplaying(false);
    try {
      const response = await api.get(`/api/daylog/${selectedDate}`);
      setLog(response.data);
      // Initially, all completed tasks are fully visible
      if (response.data && response.data.blocks) {
        const completedIds = response.data.blocks
          .filter(b => b.completed)
          .map(b => b.blockId);
        setVisibleBlockIds(new Set(completedIds));
      }
    } catch (err) {
      console.error('Error fetching history log:', err);
      setError('Could not retrieve archive details for this date.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLog();
  }, [selectedDate]);

  // Dynamic focus hours calculation
  const calculateFocusHours = (blocks) => {
    if (!blocks) return '0.0';
    const totalMin = blocks
      .filter(b => b.completed)
      .reduce((acc, block) => {
        try {
          const [sHour, sMin] = block.start.split(':').map(Number);
          const [eHour, eMin] = block.end.split(':').map(Number);
          let diffMin = (eHour * 60 + eMin) - (sHour * 60 + sMin);
          if (diffMin < 0) diffMin += 24 * 60;
          return acc + diffMin;
        } catch (e) {
          return acc;
        }
      }, 0);
    return (totalMin / 60).toFixed(1);
  };

  // Automated Timeline Replay Simulation (Animation)
  const startReplay = () => {
    if (!log || !log.blocks) return;
    setReplaying(true);
    setVisibleBlockIds(new Set()); // Start empty

    const completedBlocks = log.blocks.filter(b => b.completed);
    
    if (completedBlocks.length === 0) {
      setReplaying(false);
      return;
    }

    // Playback sequential checkoffs
    completedBlocks.forEach((block, idx) => {
      setTimeout(() => {
        setVisibleBlockIds(prev => {
          const updated = new Set(prev);
          updated.add(block.blockId);
          return updated;
        });
        if (idx === completedBlocks.length - 1) {
          setTimeout(() => setReplaying(false), 500);
        }
      }, (idx + 1) * 800);
    });
  };

  const moodLabels = {
    focused: '🧠 Focused',
    energetic: '⚡ Energetic',
    tired: '🥱 Tired',
    stressed: '😰 Stressed',
    okay: '😌 Okay'
  };

  const totalBlocks = log?.blocks?.length || 0;
  const completedCount = log?.blocks?.filter(b => b.completed).length || 0;
  const focusHours = calculateFocusHours(log?.blocks);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-[#e2e8f0]">
          Study Session Replay 📜
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-[#64748b] mt-1.5">
          Step into your life archive and visual consistency timeline.
        </p>
      </div>

      {/* Date Picker & Quick Actions Card */}
      <div className="bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl p-6 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3 bg-slate-50 dark:bg-[#0a0c10] border border-slate-200 dark:border-[#1e2530] p-3 rounded-2xl w-full md:w-fit">
            <Calendar className="w-5 h-5 text-[#00e5a0]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-[#e2e8f0] font-extrabold outline-none w-full cursor-pointer"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickDate(1)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-[#1e2530] hover:bg-slate-200 dark:hover:bg-[#283141] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1e2530] transition-all"
            >
              Yesterday
            </button>
            <button
              onClick={handleLastTuesday}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-[#1e2530] hover:bg-slate-200 dark:hover:bg-[#283141] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1e2530] transition-all"
            >
              Last Tuesday
            </button>
          </div>

        </div>

        {/* Date Display */}
        <div className="mt-5 text-center md:text-left">
          <p className="text-lg font-extrabold text-slate-700 dark:text-[#e2e8f0] flex items-center justify-center md:justify-start">
            🔍 Replaying: <span className="text-[#00e5a0] ml-1.5">{getDayName(selectedDate)}</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-[#ff6b35] p-4 rounded-2xl mb-8 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00e5a0]"></div>
        </div>
      ) : log ? (
        <>
          {/* Day Archive Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            
            {/* Stat Card: Focus Hours */}
            <div className="bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-[#64748b] uppercase tracking-wider">
                  Focus Hours
                </p>
                <h3 className="text-3xl font-extrabold mt-1 text-slate-800 dark:text-[#e2e8f0]">
                  {focusHours} <span className="text-xs text-slate-400 dark:text-[#64748b]">hrs</span>
                </h3>
              </div>
              <div className="p-3 bg-[#00e5a0]/10 rounded-2xl">
                <Clock className="w-6 h-6 text-[#00e5a0]" />
              </div>
            </div>

            {/* Stat Card: Mood */}
            <div className="bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-[#64748b] uppercase tracking-wider">
                  Logged Mood
                </p>
                <h3 className="text-xl font-extrabold mt-1.5 text-slate-800 dark:text-[#e2e8f0]">
                  {log.mood ? moodLabels[log.mood] || log.mood : 'Not Recorded 💤'}
                </h3>
              </div>
              <div className="p-3 bg-indigo-500/10 rounded-2xl">
                <Smile className="w-6 h-6 text-indigo-500" />
              </div>
            </div>

            {/* Stat Card: Productivity */}
            <div className="bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-[#64748b] uppercase tracking-wider">
                  Productivity Score
                </p>
                <h3 className="text-3xl font-extrabold mt-1 text-[#00e5a0]">
                  {log.productivityScore ? `${log.productivityScore} / 10` : 'Not Rated 📊'}
                </h3>
              </div>
              <div className="p-3 bg-pink-500/10 rounded-2xl">
                <Award className="w-6 h-6 text-pink-500" />
              </div>
            </div>

          </div>

          {/* Daily Reflection Card */}
          {log.reflectionNote && (
            <div className="bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl p-6 shadow-sm mb-8">
              <h3 className="text-base font-bold text-[#00e5a0] mb-2 flex items-center">
                ✨ Daily Reflection Note
              </h3>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-[#0a0c10]/40 border border-slate-100 dark:border-[#1e2530] p-4 rounded-2xl whitespace-pre-wrap">
                "{log.reflectionNote}"
              </p>
            </div>
          )}

          {/* Timeline and Replay Card */}
          <div className="bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl p-6 shadow-sm">
            
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-[#e2e8f0]">
                  Timeline Replay
                </h3>
                <p className="text-xs font-semibold text-slate-400 dark:text-[#64748b] mt-0.5">
                  Tasks Completion Rate: <span className="font-extrabold text-[#00e5a0]">{log.completionPercent}%</span> ({completedCount}/{totalBlocks} tasks)
                </p>
              </div>

              {completedCount > 0 && (
                <button
                  onClick={startReplay}
                  disabled={replaying}
                  className="flex items-center px-4 py-2 bg-[#00e5a0] hover:bg-[#00c98c] disabled:bg-[#00e5a0]/30 disabled:cursor-not-allowed text-black font-extrabold text-xs rounded-xl shadow-md transition-all duration-200"
                >
                  {replaying ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 mr-2 animate-spin" />
                      Replaying...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 mr-2 fill-black" />
                      Play Replay ⏱️
                    </>
                  )}
                </button>
              )}
            </div>

            {totalBlocks === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 dark:border-[#1e2530] rounded-3xl p-6 text-center">
                <p className="text-lg font-bold text-slate-600 dark:text-[#64748b]">No blocks scheduled on this day</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                  This date either had no active schedule template or was not initialized by logging in.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {log.blocks.map((block) => {
                  const isChecked = block.completed && visibleBlockIds.has(block.blockId);
                  const bgOpacityStyle = isChecked ? `${block.color}15` : 'transparent';

                  return (
                    <div
                      key={block.blockId}
                      className="flex items-center justify-between p-4 border border-slate-100 dark:border-[#1e2530] rounded-2xl bg-slate-50/50 dark:bg-[#0a0c10]/30 transition-all duration-500"
                      style={{
                        borderColor: isChecked ? `${block.color}35` : '',
                        backgroundColor: isChecked ? bgOpacityStyle : '',
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-2.5 h-12 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: block.color,
                            boxShadow: isChecked ? `0 0 10px ${block.color}80` : ''
                          }}
                        />
                        <div>
                          <h4
                            className={`text-base font-bold text-slate-800 dark:text-[#e2e8f0] transition-all duration-300 ${
                              isChecked ? 'line-through text-slate-400 dark:text-[#64748b]' : ''
                            }`}
                          >
                            {block.label}
                          </h4>
                          <p className="text-xs font-semibold text-slate-400 dark:text-[#64748b] mt-0.5">
                            ⏰ {block.start} — {block.end}
                          </p>
                        </div>
                      </div>

                      <div>
                        {isChecked ? (
                          <CheckCircle2
                            className="w-7 h-7 text-[#00e5a0] transition-all duration-300 transform scale-110"
                            style={{ color: block.color, fill: `${block.color}10` }}
                          />
                        ) : block.completed ? (
                          <div className="w-7 h-7 rounded-full border-2 border-slate-200 dark:border-[#1e2530] flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-[#1e2530]" />
                          </div>
                        ) : (
                          <XCircle className="w-7 h-7 text-slate-300 dark:text-[#1e2530]" />
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl text-center">
          <p className="text-lg font-bold text-slate-600 dark:text-[#64748b]">No history log found</p>
        </div>
      )}

    </div>
  );
};

export default HistoryReplay;
