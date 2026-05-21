import React, { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { api } from '../context/AuthContext';
import { Calendar, Flame, GraduationCap, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const HeatmapView = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [heatmapData, setHeatmapData] = useState([]);
  const [streak, setStreak] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tooltip State
  const [hoveredValue, setHoveredValue] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchHeatmapData();
  }, [selectedYear]);

  const fetchHeatmapData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/heatmap?year=${selectedYear}`);
      setHeatmapData(response.data.heatmapData);
      setStreak(response.data.streak);
      setTotalDays(response.data.totalDays);
      setError('');
    } catch (err) {
      console.error('Error fetching heatmap:', err);
      setError('Could not load consistency data.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevYear = () => {
    setSelectedYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    setSelectedYear(prev => prev + 1);
  };

  // Determine percentage class for calendar block
  const getClassForValue = (value) => {
    if (!value || value.count === 0) {
      return 'color-empty';
    }
    const pct = value.count;
    if (pct < 30) return 'color-scale-1'; // Faint Green
    if (pct < 60) return 'color-scale-2'; // Medium Green
    if (pct < 90) return 'color-scale-3'; // Bright Green
    return 'color-scale-4'; // Full Accent Green
  };

  // Calculate consistency (percentage of completed days out of total check-ins)
  const getConsistencyPercent = () => {
    if (heatmapData.length === 0) return 0;
    const completedDays = heatmapData.filter(d => d.count === 100).length;
    return Math.round((completedDays / heatmapData.length) * 100) || 0;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Title */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-[#00e5a0]/10 rounded-2xl">
          <Calendar className="w-6 h-6 text-[#00e5a0]" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-[#e2e8f0]">
            Consistency Heatmap
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#64748b]">
            Visualize your historical focus blocks and study streaks.
          </p>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-[#ff6b35] p-4 rounded-2xl mb-8 text-sm">
          {error}
        </div>
      )}

      {/* Stat Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Streak */}
        <div className="bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-[#64748b] uppercase tracking-wider">
              Current Streak
            </p>
            <h3 className="text-3xl font-extrabold mt-1 text-slate-800 dark:text-[#e2e8f0]">
              {streak} {streak === 1 ? 'day' : 'days'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#64748b] mt-1">
              🔥 Keep the chain alive!
            </p>
          </div>
          <div className="p-4 bg-orange-500/10 rounded-2xl">
            <Flame className="w-8 h-8 text-orange-500 fill-orange-500" />
          </div>
        </div>

        {/* Total days studied */}
        <div className="bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-[#64748b] uppercase tracking-wider">
              Total Days Studied
            </p>
            <h3 className="text-3xl font-extrabold mt-1 text-slate-800 dark:text-[#e2e8f0]">
              {totalDays} {totalDays === 1 ? 'day' : 'days'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#64748b] mt-1">
              🎓 Days logged with focus time.
            </p>
          </div>
          <div className="p-4 bg-[#00e5a0]/10 rounded-2xl">
            <GraduationCap className="w-8 h-8 text-[#00e5a0]" />
          </div>
        </div>

        {/* Consistency rate */}
        <div className="bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-[#64748b] uppercase tracking-wider">
              Perfect Day Rate
            </p>
            <h3 className="text-3xl font-extrabold mt-1 text-[#00e5a0]">
              {getConsistencyPercent()}%
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#64748b] mt-1">
              ✅ Logged days completed at 100%.
            </p>
          </div>
          <div className="p-4 bg-[#00e5a0]/10 rounded-2xl">
            <Check className="w-8 h-8 text-[#00e5a0] stroke-[3]" />
          </div>
        </div>
      </div>

      {/* Heatmap Grid Panel */}
      <div className="bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl p-6 md:p-8 shadow-sm">
        
        {/* Heatmap Header (Year Controller) */}
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-lg font-bold text-slate-800 dark:text-[#e2e8f0]">
            Activity Chart
          </h3>
          <div className="flex items-center space-x-3 bg-slate-50 dark:bg-[#0a0c10] border border-slate-200 dark:border-[#1e2530] p-1.5 rounded-2xl">
            <button
              onClick={handlePrevYear}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-[#1e2530] text-slate-600 dark:text-slate-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-extrabold px-3 text-slate-700 dark:text-[#e2e8f0]">
              {selectedYear}
            </span>
            <button
              onClick={handleNextYear}
              disabled={selectedYear >= new Date().getFullYear()}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-[#1e2530] text-slate-600 dark:text-slate-400 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00e5a0]"></div>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[700px] px-2">
              <CalendarHeatmap
                startDate={new Date(`${selectedYear}-01-01`)}
                endDate={new Date(`${selectedYear}-12-31`)}
                values={heatmapData}
                classForValue={getClassForValue}
                onMouseOver={(event, value) => {
                  if (value && value.date) {
                    setHoveredValue(value);
                    const rect = event.target.getBoundingClientRect();
                    setTooltipPos({
                      x: rect.left + window.scrollX + rect.width / 2,
                      y: rect.top + window.scrollY - 44
                    });
                  }
                }}
                onMouseLeave={() => {
                  setHoveredValue(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Heatmap Legend */}
        <div className="flex items-center justify-end space-x-2 text-xs font-bold text-slate-400 dark:text-[#64748b] mt-4 border-t border-slate-100 dark:border-[#1e2530] pt-4">
          <span>Less</span>
          <div className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-[#1e2530]" title="0%" />
          <div className="w-3.5 h-3.5 rounded bg-[#d1fae5] dark:bg-[#00422c]" title="1%-29%" />
          <div className="w-3.5 h-3.5 rounded bg-[#6ee7b7] dark:bg-[#00734c]" title="30%-59%" />
          <div className="w-3.5 h-3.5 rounded bg-[#34d399] dark:bg-[#00b375]" title="60%-89%" />
          <div className="w-3.5 h-3.5 rounded bg-[#00e5a0]" title="90%-100%" />
          <span>More</span>
        </div>

      </div>

      {/* Tooltip Overlay */}
      {hoveredValue && (
        <div
          className="absolute z-50 bg-[#161b24] border border-[#1e2530] text-[#e2e8f0] px-3.5 py-2 rounded-2xl text-xs font-extrabold shadow-xl -translate-x-1/2 pointer-events-none transition-all duration-150 animate-glow"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <span className="text-[#00e5a0]">{hoveredValue.date}</span>: {hoveredValue.count}% completed
        </div>
      )}

    </div>
  );
};

export default HeatmapView;
