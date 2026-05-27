import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { Calendar, TrendingUp, Sparkles, AlertCircle, Quote, Star, Award, BookOpen, Flame } from 'lucide-react';

const WeeklyReview = () => {
  // Default to the Monday of the current week
  const getInitialMondayStr = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(d.setDate(diff));
    const y = monday.getFullYear();
    const m = String(monday.getMonth() + 1).padStart(2, '0');
    const dayVal = String(monday.getDate()).padStart(2, '0');
    return `${y}-${m}-${dayVal}`;
  };

  const [startDate, setStartDate] = useState(getInitialMondayStr);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const fetchWeeklyReview = async () => {
    setLoading(true);
    setError('');
    setData(null);
    try {
      const response = await api.get(`/api/daylog/review/weekly`, {
        params: { startDate }
      });
      setData(response.data);
    } catch (err) {
      console.error('Error fetching weekly review:', err);
      setError('Could not load weekly review metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyReview();
  }, [startDate]);

  const moodEmojis = {
    focused: '🧠 Focused',
    energetic: '⚡ Energetic',
    tired: '🥱 Tired',
    stressed: '😰 Stressed',
    okay: '😌 Okay',
    'not logged': '💤 Not Logged'
  };

  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Quick navigation helpers
  const handleShiftWeek = (weeks) => {
    const [year, month, day] = startDate.split('-').map(Number);
    const current = new Date(year, month - 1, day);
    current.setDate(current.getDate() + (weeks * 7));
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const dayVal = String(current.getDate()).padStart(2, '0');
    setStartDate(`${y}-${m}-${dayVal}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-[#e2e8f0]">
            Weekly Review wrap-up 📊
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-[#64748b] mt-1.5">
            Reflect on weekly statistics, streaks, and focus consistency.
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center space-x-2 bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] p-1.5 rounded-2xl shadow-sm">
          <button
            onClick={() => handleShiftWeek(-1)}
            className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#0a0c10] text-slate-500 dark:text-[#64748b] transition-all font-bold text-sm"
          >
            ◀ Last Week
          </button>
          
          <div className="px-3 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[#00e5a0]" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-xs sm:text-sm text-slate-800 dark:text-[#e2e8f0] font-extrabold outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => handleShiftWeek(1)}
            className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#0a0c10] text-slate-500 dark:text-[#64748b] transition-all font-bold text-sm"
          >
            Next Week ▶
          </button>
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
      ) : data ? (
        <>
          {/* Main Highlights Wrap Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#00e5a0]/15 to-[#00bc7f]/5 dark:from-[#00e5a0]/10 dark:to-[#00bc7f]/0 border border-[#00e5a0]/30 rounded-3xl p-6 sm:p-8 shadow-md mb-8">
            <div className="relative z-10">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#00e5a0]/15 text-[#00e5a0] border border-[#00e5a0]/20 mb-4 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 mr-1" /> Weekly Wrap-up
              </span>
              
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-[#e2e8f0] leading-snug">
                “You completed <span className="text-[#00e5a0]">{data.completedTasks}</span> tasks, studied <span className="text-[#00e5a0]">{data.focusHours}</span> hours, and your best mood was ‘<span className="text-[#00e5a0] font-bold">{data.bestMood ? data.bestMood : 'not logged'}</span>’.”
              </h2>
              
              <p className="text-xs font-semibold text-slate-500 dark:text-[#64748b] mt-3">
                🗓️ Week Boundary: {formatDateDisplay(data.startDate)} — {formatDateDisplay(data.endDate)}
              </p>
            </div>
            
            {/* Background design elements */}
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12">
              <TrendingUp className="w-72 h-72 text-[#00e5a0]" />
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {/* Total Study hours */}
            <div className="bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-[#64748b] uppercase tracking-wider">
                  Study Duration
                </p>
                <h3 className="text-2xl font-extrabold mt-1 text-slate-800 dark:text-[#e2e8f0]">
                  {data.focusHours} hrs
                </h3>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                <Award className="w-6 h-6" />
              </div>
            </div>

            {/* Total Tasks completed */}
            <div className="bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-[#64748b] uppercase tracking-wider">
                  Total Completed
                </p>
                <h3 className="text-2xl font-extrabold mt-1 text-slate-800 dark:text-[#e2e8f0]">
                  {data.completedTasks} tasks
                </h3>
              </div>
              <div className="p-3 bg-[#00e5a0]/10 rounded-2xl text-[#00e5a0]">
                <Star className="w-6 h-6" />
              </div>
            </div>

            {/* Streak card */}
            <div className="bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-[#64748b] uppercase tracking-wider">
                  Weekly Max Streak
                </p>
                <h3 className="text-2xl font-extrabold mt-1 text-orange-500">
                  {data.longestStreak} {data.longestStreak === 1 ? 'day' : 'days'}
                </h3>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
                <Flame className="w-6 h-6 fill-orange-500" />
              </div>
            </div>
          </div>

          {/* Performance Comparison Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            {/* Card: Strongest Day */}
            <div className="bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold text-[#00e5a0] bg-[#00e5a0]/15 border border-[#00e5a0]/20 px-3 py-1 rounded-full uppercase tracking-wider">
                  💪 Strongest Day
                </span>
                
                {data.strongestDay ? (
                  <div className="mt-5">
                    <h3 className="text-xl font-extrabold text-slate-800 dark:text-[#e2e8f0]">
                      {capitalize(data.strongestDay.dayOfWeek)}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-[#64748b] mt-1">
                      📅 {formatDateDisplay(data.strongestDay.date)}
                    </p>

                    <div className="mt-5 space-y-3.5">
                      <div className="flex justify-between items-center text-sm font-semibold border-b border-slate-50 dark:border-[#1e2530] pb-2">
                        <span className="text-slate-400 dark:text-[#64748b]">Completion Rate</span>
                        <span className="text-slate-800 dark:text-[#e2e8f0] font-bold">{data.strongestDay.completionPercent}%</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm font-semibold border-b border-slate-50 dark:border-[#1e2530] pb-2">
                        <span className="text-slate-400 dark:text-[#64748b]">Productivity Score</span>
                        <span className="text-[#00e5a0] font-bold">{data.strongestDay.productivityScore ? `${data.strongestDay.productivityScore} / 10` : 'Not Rated'}</span>
                      </div>

                      <div className="flex justify-between items-center text-sm font-semibold pb-1">
                        <span className="text-slate-400 dark:text-[#64748b]">Mood logged</span>
                        <span className="text-slate-800 dark:text-[#e2e8f0] font-bold">
                          {data.strongestDay.mood ? moodEmojis[data.strongestDay.mood] || data.strongestDay.mood : 'Not Logged'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-[#64748b] mt-6">No study sessions logged on this week.</p>
                )}
              </div>
            </div>

            {/* Card: Weakest Day */}
            <div className="bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold text-pink-500 bg-pink-500/10 border border-pink-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                  ⚠️ Weakest Day
                </span>
                
                {data.weakestDay ? (
                  <div className="mt-5">
                    <h3 className="text-xl font-extrabold text-slate-800 dark:text-[#e2e8f0]">
                      {capitalize(data.weakestDay.dayOfWeek)}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-[#64748b] mt-1">
                      📅 {formatDateDisplay(data.weakestDay.date)}
                    </p>

                    <div className="mt-5 space-y-3.5">
                      <div className="flex justify-between items-center text-sm font-semibold border-b border-slate-50 dark:border-[#1e2530] pb-2">
                        <span className="text-slate-400 dark:text-[#64748b]">Completion Rate</span>
                        <span className="text-slate-800 dark:text-[#e2e8f0] font-bold">{data.weakestDay.completionPercent}%</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm font-semibold border-b border-slate-50 dark:border-[#1e2530] pb-2">
                        <span className="text-slate-400 dark:text-[#64748b]">Productivity Score</span>
                        <span className="text-slate-800 dark:text-[#e2e8f0] font-bold">{data.weakestDay.productivityScore ? `${data.weakestDay.productivityScore} / 10` : 'Not Rated'}</span>
                      </div>

                      <div className="flex justify-between items-center text-sm font-semibold pb-1">
                        <span className="text-slate-400 dark:text-[#64748b]">Mood logged</span>
                        <span className="text-slate-800 dark:text-[#e2e8f0] font-bold">
                          {data.weakestDay.mood ? moodEmojis[data.weakestDay.mood] || data.weakestDay.mood : 'Not Logged'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-[#64748b] mt-6">No study sessions logged on this week.</p>
                )}
              </div>
            </div>

          </div>

          {/* Reflection Highlights section */}
          <div className="bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-[#e2e8f0] mb-5 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-[#00e5a0]" /> Reflection Highlights
            </h3>

            {data.reflectionHighlights.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Quote className="w-10 h-10 text-slate-200 dark:text-[#1e2530] mb-2.5" />
                <p className="text-sm font-bold text-slate-500 dark:text-[#64748b]">No reflection notes recorded this week.</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Reflect and log notes inside your daily study logs to save memories.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.reflectionHighlights.map((highlight, idx) => (
                  <div
                    key={highlight.date}
                    className="p-5 bg-slate-50/50 dark:bg-[#0a0c10]/40 border border-slate-100 dark:border-[#1e2530] rounded-2xl relative overflow-hidden"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
                      <span className="text-xs font-extrabold text-[#00e5a0] bg-[#00e5a0]/10 border border-[#00e5a0]/20 px-3 py-1 rounded-full uppercase tracking-wider">
                        {capitalize(highlight.dayOfWeek)}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 dark:text-[#64748b]">
                        📅 {formatDateDisplay(highlight.date)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-300 italic whitespace-pre-wrap leading-relaxed">
                      "{highlight.reflectionNote}"
                    </p>

                    <div className="mt-4 pt-3.5 border-t border-slate-100/50 dark:border-[#1e2530]/50 flex flex-wrap gap-4 text-xs font-bold text-slate-400 dark:text-[#64748b]">
                      {highlight.mood && <span>Mood: <span className="text-slate-800 dark:text-[#e2e8f0]">{moodEmojis[highlight.mood] || highlight.mood}</span></span>}
                      {highlight.productivityScore && <span>Productivity: <span className="text-[#00e5a0]">{highlight.productivityScore}/10</span></span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 dark:text-[#1e2530] mb-3" />
          <p className="text-lg font-bold text-slate-600 dark:text-[#64748b]">No review data found for this week</p>
        </div>
      )}

    </div>
  );
};

export default WeeklyReview;
