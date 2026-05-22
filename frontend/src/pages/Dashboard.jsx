import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext, api } from '../context/AuthContext';
import { CheckCircle2, Circle, Flame, CheckSquare, Award, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [log, setLog] = useState(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Get today's local date in YYYY-MM-DD
  const getTodayDateStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };


  const todayStr = getTodayDateStr();

  // 2. Format today's date for display (e.g., "Wednesday, May 20, 2026")
  const getFormattedDateDisplay = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  // 3. Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    fetchDailyLogAndStats();
  }, []);

  const fetchDailyLogAndStats = async () => {
    setLoading(true);
    try {
      // Fetch today's day log and streak statistics concurrently to double loading speed!
      const [logRes, statsRes] = await Promise.all([
        api.get(`/api/daylog/${todayStr}`),
        api.get('/api/heatmap')
      ]);

      setLog(logRes.data);
      setStreak(statsRes.data.streak);
      setError('');
    } catch (err) {
      console.error('Error fetching today\'s log or stats:', err);
      setError('Could not load your schedule logs for today.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle block completion status
  const handleToggleBlock = async (blockId, currentCompleted) => {
    try {
      // optimistic UI update for instant feedback
      const updatedBlocks = log.blocks.map(b => {
        if (b.blockId === blockId) {
          return { ...b, completed: !currentCompleted };
        }
        return b;
      });

      const totalBlocks = updatedBlocks.length;
      const completedBlocks = updatedBlocks.filter(b => b.completed).length;
      const newPercent = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;

      setLog(prev => ({
        ...prev,
        blocks: updatedBlocks,
        completionPercent: newPercent,
        checkedIn: completedBlocks > 0
      }));

      // Call API
      const response = await api.patch(`/api/daylog/${todayStr}/block/${blockId}`, {
        completed: !currentCompleted
      });

      // Update state with confirmed DB values
      setLog(response.data);

      // Refresh streaks immediately (since completing 100% can change streak)
      const statsRes = await api.get('/api/heatmap');
      setStreak(statsRes.data.streak);
    } catch (err) {
      console.error('Error toggling block status:', err);
      setError('Failed to update task completion status.');
      // Refetch on failure to sync
      fetchDailyLogAndStats();
    }
  };

  // Force sync daily log from the template
  const handleSyncTemplate = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/api/daylog/${todayStr}/sync`);
      setLog(response.data);

      const statsRes = await api.get('/api/heatmap');
      setStreak(statsRes.data.streak);
      setError('');
    } catch (err) {
      console.error('Error syncing template:', err);
      setError('Could not sync today\'s tasks with the template.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00e5a0]"></div>
      </div>
    );
  }

  const totalBlocks = log?.blocks?.length || 0;
  const completedBlocksCount = log?.blocks?.filter(b => b.completed).length || 0;
  const progressPercent = log?.completionPercent || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Greetings Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-[#e2e8f0]">
            {getGreeting()}, <span className="text-[#00e5a0]">{user?.name}</span>
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-[#64748b] mt-1.5">
            🗓️ {getFormattedDateDisplay()}
          </p>
        </div>
        {progressPercent === 100 && (
          <div className="flex items-center space-x-2 bg-[#00e5a0]/15 dark:bg-[#00e5a0]/10 border border-[#00e5a0]/30 text-[#00e5a0] px-4 py-2.5 rounded-2xl animate-bounce text-sm font-extrabold w-fit">
            <ShieldCheck className="w-5 h-5 text-[#00e5a0]" />
            <span>100% Day Completed! 🔥</span>
          </div>
        )}
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-[#ff6b35] p-4 rounded-2xl mb-8 text-sm">
          {error}
        </div>
      )}

      {/* 3 Stat Cards at top */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Streak */}
        <div className="bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-[#64748b] uppercase tracking-wider">
              Current Streak
            </p>
            <h3 className="text-3xl font-extrabold mt-1 text-slate-800 dark:text-[#e2e8f0]">
              {streak} {streak === 1 ? 'day' : 'days'}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-[#64748b] mt-1">
              (100% completion required)
            </p>
          </div>
          <div className="p-4 bg-orange-500/10 rounded-2xl">
            <Flame className="w-8 h-8 text-orange-500 fill-orange-500" />
          </div>
        </div>

        {/* Card 2: Completed */}
        <div className="bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-[#64748b] uppercase tracking-wider">
              Blocks Completed
            </p>
            <h3 className="text-3xl font-extrabold mt-1 text-slate-800 dark:text-[#e2e8f0]">
              {completedBlocksCount} <span className="text-slate-400 dark:text-[#64748b] text-xl">/ {totalBlocks}</span>
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-[#64748b] mt-1">
              Keep checking off your template!
            </p>
          </div>
          <div className="p-4 bg-[#00e5a0]/10 rounded-2xl">
            <CheckSquare className="w-8 h-8 text-[#00e5a0]" />
          </div>
        </div>

        {/* Card 3: Progress % */}
        <div className="bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-[#64748b] uppercase tracking-wider">
              Daily Progress
            </p>
            <h3 className="text-3xl font-extrabold mt-1 text-[#00e5a0]">
              {progressPercent}%
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-[#64748b] mt-1">
              Target: 100% for streak!
            </p>
          </div>
          <div className="p-4 bg-blue-500/10 rounded-2xl">
            <Award className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl p-6 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-sm font-bold text-slate-600 dark:text-[#64748b]">Focus Progress</span>
          <span className="text-sm font-extrabold text-[#00e5a0]">{progressPercent}% Done</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-[#0a0c10] rounded-full h-3 overflow-hidden border border-slate-200 dark:border-[#1e2530]">
          <div
            className="bg-gradient-to-r from-[#00e5a0] to-[#00bc7f] h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Today's Schedule List */}
      <div>
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h3 className="text-xl font-extrabold text-slate-800 dark:text-[#e2e8f0]">
            Today's Tasks
          </h3>
          <button
            onClick={handleSyncTemplate}
            className="flex items-center text-xs font-extrabold px-4 py-2 bg-slate-100 dark:bg-[#1e2530] text-slate-600 dark:text-[#00e5a0] border border-slate-200 dark:border-[#1e2530] hover:bg-[#00e5a0]/15 dark:hover:bg-[#00e5a0]/10 rounded-xl transition-all duration-200"
            title="Reload today's snapshot from template database"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-2" />
            Sync Template
          </button>
        </div>

        {totalBlocks === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 dark:border-[#1e2530] rounded-3xl p-8 bg-white dark:bg-[#161b24] text-center">
            <p className="text-lg font-bold text-slate-700 dark:text-[#e2e8f0]">No schedule set for today!</p>
            <p className="text-sm text-slate-400 dark:text-[#64748b] mt-2 max-w-sm">
              Tracker auto-snapshots your templates. Set your schedule templates on the Builder page first!
            </p>
            <Link
              to="/schedule"
              className="mt-6 inline-flex items-center px-6 py-3 rounded-2xl bg-[#00e5a0] hover:bg-[#00c98c] text-black font-extrabold text-sm shadow-md transition-colors"
            >
              Go to Schedule Builder
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {log.blocks.map((block) => {
              const bgOpacityStyle = block.completed ? `${block.color}15` : 'transparent';

              return (
                <div
                  key={block.blockId}
                  onClick={() => handleToggleBlock(block.blockId, block.completed)}
                  className="flex items-center justify-between p-5 border rounded-2xl shadow-sm hover:translate-x-1 cursor-pointer transition-all duration-300 select-none bg-white dark:bg-[#161b24]"
                  style={{
                    borderColor: block.completed ? `${block.color}40` : '',
                    backgroundColor: block.completed ? bgOpacityStyle : '',
                  }}
                >
                  <div className="flex items-center space-x-5">
                    {/* Left color bar */}
                    <div
                      className="w-3 h-14 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: block.color,
                        boxShadow: block.completed ? `0 0 12px ${block.color}80` : ''
                      }}
                    />
                    <div>
                      <h4
                        className={`text-lg font-extrabold text-slate-800 dark:text-[#e2e8f0] transition-all duration-200 ${block.completed ? 'line-through text-slate-400 dark:text-[#64748b]' : ''
                          }`}
                      >
                        {block.label}
                      </h4>
                      <p className="text-xs font-bold text-[#00e5a0] mt-1">
                        ⏰ {block.start} — {block.end}
                      </p>
                    </div>
                  </div>

                  {/* Right Circle Checkbox */}
                  <div>
                    {block.completed ? (
                      <CheckCircle2
                        className="w-8 h-8 transition-transform duration-200 transform scale-110"
                        style={{ color: block.color, fill: `${block.color}20` }}
                      />
                    ) : (
                      <Circle className="w-8 h-8 text-slate-300 dark:text-[#1e2530] hover:text-[#00e5a0] transition-colors" />
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
