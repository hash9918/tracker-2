import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  Sparkles,
  Tag,
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock,
  CheckSquare,
  X,
  ChevronDown,
  ChevronUp,
  Timer,
  ListTodo,
  Calendar
} from 'lucide-react';

const COLORS = [
  '#00e5a0', // Cyan Green
  '#3b82f6', // Bright Blue
  '#a855f7', // Electric Purple
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#ec4899'  // Pink
];

// Helper to format duration between creation and completion
const formatDuration = (createdAt, completedAt) => {
  if (!createdAt || !completedAt) return '';
  const diffMs = Math.max(0, new Date(completedAt).getTime() - new Date(createdAt).getTime());
  const totalMins = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMins / (24 * 60));
  const hours = Math.floor((totalMins % (24 * 60)) / 60);
  const mins = totalMins % 60;

  if (totalMins < 1) return '< 1 min';
  if (days > 0) {
    if (hours > 0) return `${days}d ${hours}h`;
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    if (mins > 0) return `${hours}h ${mins}m`;
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  }
  return `${mins} min${mins > 1 ? 's' : ''}`;
};

// Helper to format friendly dates
const formatDateDisplay = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Helper for relative time
const timeAgo = (dateString) => {
  if (!dateString) return '';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const totalMins = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMins / (24 * 60));
  const hours = Math.floor((totalMins % (24 * 60)) / 60);
  
  if (totalMins < 1) return 'just now';
  if (totalMins < 60) return `${totalMins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  return formatDateDisplay(dateString);
};

const Backlog = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter Tabs
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'active' | 'completed'

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [formTasks, setFormTasks] = useState([]);
  const [currentTaskInput, setCurrentTaskInput] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Inline quick task input state per card: { [itemId]: string }
  const [quickTaskInputs, setQuickTaskInputs] = useState({});
  // Expanded descriptions state per card: { [itemId]: boolean }
  const [expandedNotes, setExpandedNotes] = useState({});

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/backlog');
      setItems(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching backlog items:', err);
      setError('Failed to fetch future tasks list');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFormTask = () => {
    if (!currentTaskInput.trim()) return;
    setFormTasks([...formTasks, { text: currentTaskInput.trim(), completed: false }]);
    setCurrentTaskInput('');
  };

  const handleRemoveFormTask = (index) => {
    setFormTasks(formTasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a title for your vault goal/task');
      return;
    }

    // Include any pending task input if not submitted
    let finalTasks = [...formTasks];
    if (currentTaskInput.trim()) {
      finalTasks.push({ text: currentTaskInput.trim(), completed: false });
    }

    try {
      if (editingId) {
        // Update existing item
        const existingItem = items.find(i => i._id === editingId);
        const response = await api.put(`/api/backlog/${editingId}`, {
          title: title.trim(),
          description: description.trim(),
          color: selectedColor,
          tasks: finalTasks,
          completed: existingItem ? existingItem.completed : false,
          completedAt: existingItem ? existingItem.completedAt : null
        });

        setItems(items.map(item => item._id === editingId ? response.data : item));
        handleCancelEdit();
      } else {
        // Create new item
        const response = await api.post('/api/backlog', {
          title: title.trim(),
          description: description.trim(),
          color: selectedColor,
          tasks: finalTasks
        });

        setItems([response.data, ...items]);
        setTitle('');
        setDescription('');
        setSelectedColor(COLORS[0]);
        setFormTasks([]);
        setCurrentTaskInput('');
      }
    } catch (err) {
      console.error('Error saving backlog item:', err);
      setError('Could not save the future task.');
    }
  };

  const handleStartEdit = (item) => {
    setEditingId(item._id);
    setTitle(item.title);
    setDescription(item.description || '');
    setSelectedColor(item.color || COLORS[0]);
    setFormTasks(item.tasks ? item.tasks.map(t => ({ text: t.text, completed: t.completed || false })) : []);
    setCurrentTaskInput('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setSelectedColor(COLORS[0]);
    setFormTasks([]);
    setCurrentTaskInput('');
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/backlog/${id}`);
      setItems(items.filter(item => item._id !== id));
      setError('');
    } catch (err) {
      console.error('Error deleting backlog item:', err);
      setError('Could not delete the backlog task.');
    }
  };

  // Toggle entire Vault completion
  const handleToggleVaultComplete = async (item) => {
    const nextCompleted = !item.completed;
    const now = new Date();
    
    // Optimistic UI update
    setItems(items.map(i => {
      if (i._id === item._id) {
        return {
          ...i,
          completed: nextCompleted,
          completedAt: nextCompleted ? now.toISOString() : null,
          tasks: i.tasks ? i.tasks.map(t => ({
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? now.toISOString() : null
          })) : []
        };
      }
      return i;
    }));

    try {
      const response = await api.patch(`/api/backlog/${item._id}/toggle`);
      setItems(items => items.map(i => i._id === item._id ? response.data : i));
    } catch (err) {
      console.error('Error toggling vault completion:', err);
      fetchItems(); // revert on error
    }
  };

  // Toggle individual Subtask within a Vault
  const handleToggleSubtask = async (itemId, taskIndex) => {
    // Optimistic update
    setItems(items.map(item => {
      if (item._id === itemId && item.tasks && item.tasks[taskIndex]) {
        const updatedTasks = [...item.tasks];
        const nextCompleted = !updatedTasks[taskIndex].completed;
        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : null
        };
        const allDone = updatedTasks.length > 0 && updatedTasks.every(t => t.completed);
        return {
          ...item,
          tasks: updatedTasks,
          completed: allDone ? true : item.completed && !allDone ? false : item.completed,
          completedAt: allDone && !item.completed ? new Date().toISOString() : (!allDone && item.completed) ? null : item.completedAt
        };
      }
      return item;
    }));

    try {
      const response = await api.patch(`/api/backlog/${itemId}/tasks/${taskIndex}/toggle`);
      setItems(items => items.map(i => i._id === itemId ? response.data : i));
    } catch (err) {
      console.error('Error toggling subtask:', err);
      fetchItems();
    }
  };

  // Add inline subtask directly on the vault card
  const handleAddInlineSubtask = async (itemId) => {
    const text = (quickTaskInputs[itemId] || '').trim();
    if (!text) return;

    // Reset input
    setQuickTaskInputs(prev => ({ ...prev, [itemId]: '' }));

    try {
      const response = await api.post(`/api/backlog/${itemId}/tasks`, { text });
      setItems(items.map(i => i._id === itemId ? response.data : i));
    } catch (err) {
      console.error('Error adding subtask:', err);
      setError('Could not add task to vault');
    }
  };

  const toggleExpandNote = (itemId) => {
    setExpandedNotes(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Counts
  const totalCount = items.length;
  const activeCount = items.filter(i => !i.completed).length;
  const completedCount = items.filter(i => i.completed).length;

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesTab =
      filterTab === 'all' ||
      (filterTab === 'active' && !item.completed) ||
      (filterTab === 'completed' && item.completed);

    if (!matchesTab) return false;

    const query = searchQuery.toLowerCase();
    const titleMatch = item.title.toLowerCase().includes(query);
    const descMatch = item.description && item.description.toLowerCase().includes(query);
    const taskMatch = item.tasks && item.tasks.some(t => t.text.toLowerCase().includes(query));

    return titleMatch || descMatch || taskMatch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-[#00e5a0]/10 rounded-2xl border border-[#00e5a0]/20">
            <Sparkles className="w-7 h-7 text-[#00e5a0]" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-[#e2e8f0] flex items-center gap-2.5">
              Future Vault
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#00e5a0]/15 text-[#00e5a0] border border-[#00e5a0]/30">
                {items.length} {items.length === 1 ? 'Vault' : 'Vaults'}
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-[#64748b] mt-0.5">
              A safe space for ideas, goals, and tasks you want to tackle someday. Track progress and time-to-completion!
            </p>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-[#ff6b35] p-4 rounded-2xl mb-6 text-sm flex items-center shadow-sm">
          <AlertCircle className="w-5 h-5 mr-2.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Builder */}
        <div className="bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl p-6 shadow-sm h-fit sticky top-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-[#e2e8f0] mb-5 flex items-center justify-between">
            <span className="flex items-center">
              {editingId ? (
                <>
                  <Pencil className="w-5 h-5 mr-2 text-[#00e5a0]" />
                  Edit Vault
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2 text-[#00e5a0]" />
                  Create Future Vault
                </>
              )}
            </span>
            {editingId && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Editing Mode
              </span>
            )}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Vault Title */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-[#64748b] uppercase tracking-wider mb-2">
                Vault Goal / Title *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-[#64748b]">
                  <Tag className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#0a0c10] border border-slate-200 dark:border-[#1e2530] rounded-2xl text-slate-800 dark:text-[#e2e8f0] focus:ring-2 focus:ring-[#00e5a0] outline-none text-sm transition-all"
                  placeholder="e.g. Master Full-Stack System Design"
                  required
                />
              </div>
            </div>

            {/* Checklist / Tasks inside the Vault */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-[#64748b] uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ListTodo className="w-3.5 h-3.5 text-[#00e5a0]" />
                  Tasks in this Vault
                </span>
                <span className="text-[11px] text-slate-400 normal-case font-medium">
                  {formTasks.length} {formTasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </label>
              
              {/* Task list in builder */}
              {formTasks.length > 0 && (
                <div className="space-y-1.5 mb-2.5 max-h-40 overflow-y-auto pr-1">
                  {formTasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-[#0a0c10] border border-slate-200 dark:border-[#1e2530] rounded-xl text-xs text-slate-700 dark:text-slate-300 group"
                    >
                      <span className="flex items-center gap-2 truncate pr-2">
                        <CheckSquare className="w-3.5 h-3.5 text-[#00e5a0] flex-shrink-0" />
                        <span className="truncate">{task.text}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFormTask(idx)}
                        className="text-slate-400 hover:text-red-500 opacity-80 hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                        title="Remove task"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Task input adder */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentTaskInput}
                  onChange={(e) => setCurrentTaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFormTask();
                    }
                  }}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-[#0a0c10] border border-slate-200 dark:border-[#1e2530] rounded-xl text-slate-800 dark:text-[#e2e8f0] focus:ring-2 focus:ring-[#00e5a0] outline-none text-xs placeholder-slate-400"
                  placeholder="Add a specific task or step..."
                />
                <button
                  type="button"
                  onClick={handleAddFormTask}
                  className="px-3.5 py-2.5 bg-slate-100 dark:bg-[#1e2530] hover:bg-[#00e5a0]/20 hover:text-[#00e5a0] text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-[#64748b] uppercase tracking-wider mb-2">
                Description / Notes (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0a0c10] border border-slate-200 dark:border-[#1e2530] rounded-2xl text-slate-800 dark:text-[#e2e8f0] focus:ring-2 focus:ring-[#00e5a0] outline-none h-24 resize-none text-xs leading-relaxed"
                placeholder="Add context, resources, links, or details..."
              />
            </div>

            {/* Color Theme */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-[#64748b] uppercase tracking-wider mb-2.5">
                Theme Color
              </label>
              <div className="flex flex-wrap gap-2.5">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform duration-150 relative cursor-pointer ${
                      selectedColor === color
                        ? 'scale-110 border-white dark:border-[#0a0c10] shadow-md ring-2 ring-[#00e5a0]'
                        : 'border-transparent opacity-80 hover:scale-105'
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

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#00e5a0] hover:bg-[#00c98c] text-black font-extrabold text-sm shadow-md transition-all duration-150 flex items-center justify-center cursor-pointer"
              >
                {editingId ? (
                  <>
                    <Pencil className="w-4 h-4 mr-2 stroke-[3]" />
                    Update Vault
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2 stroke-[3]" />
                    Save in Vault
                  </>
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-[#1e2530] hover:bg-slate-200 dark:hover:bg-[#283141] text-slate-700 dark:text-slate-300 font-bold text-xs transition-all duration-150 flex items-center justify-center cursor-pointer"
                >
                  Cancel Editing
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Vault Task List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls Bar: Search & Status Filter Tabs */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-[#64748b]">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-2xl text-slate-800 dark:text-[#e2e8f0] focus:ring-2 focus:ring-[#00e5a0] outline-none shadow-sm placeholder-slate-400 text-sm"
                placeholder="Search vaults, tasks, or notes..."
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center p-1 bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-2xl shadow-sm self-start sm:self-auto">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterTab === 'all'
                    ? 'bg-[#00e5a0] text-black shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filterTab === 'all' ? 'bg-black/15 text-black' : 'bg-slate-100 dark:bg-[#1e2530] text-slate-500'
                }`}>
                  {totalCount}
                </span>
              </button>

              <button
                onClick={() => setFilterTab('active')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterTab === 'active'
                    ? 'bg-[#00e5a0] text-black shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Active
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filterTab === 'active' ? 'bg-black/15 text-black' : 'bg-slate-100 dark:bg-[#1e2530] text-slate-500'
                }`}>
                  {activeCount}
                </span>
              </button>

              <button
                onClick={() => setFilterTab('completed')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterTab === 'completed'
                    ? 'bg-[#00e5a0] text-black shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Completed
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filterTab === 'completed' ? 'bg-black/15 text-black' : 'bg-slate-100 dark:bg-[#1e2530] text-slate-500'
                }`}>
                  {completedCount}
                </span>
              </button>
            </div>
          </div>

          {/* Vault Cards Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00e5a0]"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 dark:border-[#1e2530] rounded-3xl p-8 bg-white dark:bg-[#161b24] text-center">
              <Sparkles className="w-12 h-12 text-slate-300 dark:text-[#1e2530] mb-3" />
              <p className="text-base font-bold text-slate-700 dark:text-[#e2e8f0]">
                {searchQuery
                  ? 'No matching vaults found'
                  : filterTab === 'completed'
                  ? 'No completed vaults yet'
                  : filterTab === 'active'
                  ? 'No active vaults found'
                  : 'No vaults created yet'}
              </p>
              <p className="text-xs text-slate-400 dark:text-[#64748b] mt-1 max-w-sm">
                {searchQuery
                  ? "Try searching for another keyword or clear the search query."
                  : filterTab === 'completed'
                  ? "Mark a vault as complete when you finish it to see your achievements and completion time here!"
                  : "Use the vault builder on the left to record your goals and break them into visible tasks!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => {
                const isCompleted = !!item.completed;
                const tasksList = item.tasks || [];
                const completedTasksCount = tasksList.filter(t => t.completed).length;
                const totalTasksCount = tasksList.length;
                const hasTasks = totalTasksCount > 0;
                const progressPct = hasTasks ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
                const durationText = formatDuration(item.createdAt, item.completedAt);
                const isNoteExpanded = !!expandedNotes[item._id];

                return (
                  <div
                    key={item._id}
                    className={`flex flex-col justify-between p-5 bg-white dark:bg-[#161b24] border rounded-3xl shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group ${
                      isCompleted
                        ? 'border-emerald-500/40 dark:border-emerald-500/30 bg-emerald-500/[0.02] dark:bg-emerald-950/[0.07]'
                        : 'border-slate-200 dark:border-[#1e2530]'
                    }`}
                  >
                    {/* Left accent color bar */}
                    <div
                      className="absolute top-0 left-0 bottom-0 w-2.5"
                      style={{ backgroundColor: item.color || COLORS[0] }}
                    />

                    {/* Header Area: Completion Toggle & Title */}
                    <div className="pl-2">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        {/* Title & Completion Button */}
                        <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleVaultComplete(item)}
                            className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-[#00e5a0] transition-colors cursor-pointer"
                            title={isCompleted ? "Mark as Incomplete" : "Mark Vault as Complete"}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-[#00e5a0] fill-emerald-500/10 dark:fill-[#00e5a0]/10" />
                            ) : (
                              <Circle className="w-5 h-5 hover:stroke-[#00e5a0]" />
                            )}
                          </button>
                          
                          <div className="min-w-0 flex-1">
                            <h4
                              className={`font-extrabold text-base leading-snug break-words transition-colors ${
                                isCompleted
                                  ? 'text-slate-500 dark:text-slate-400 line-through decoration-slate-400'
                                  : 'text-slate-800 dark:text-[#e2e8f0] group-hover:text-[#00e5a0]'
                              }`}
                            >
                              {item.title}
                            </h4>
                          </div>
                        </div>

                        {/* Status Badge */}
                        {isCompleted ? (
                          <span className="flex-shrink-0 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-[#00e5a0] font-bold rounded-xl text-[11px] flex items-center gap-1 shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Done
                          </span>
                        ) : (
                          <span className="flex-shrink-0 px-2.5 py-1 bg-slate-100 dark:bg-[#1e2530] text-slate-500 dark:text-slate-400 font-semibold rounded-xl text-[11px] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Active
                          </span>
                        )}
                      </div>

                      {/* Time from Vault Creation to Completion Metric */}
                      <div className="mt-2.5 mb-3 flex flex-wrap items-center gap-2 text-xs">
                        {isCompleted && item.completedAt ? (
                          <div className="w-full p-2.5 bg-emerald-500/10 dark:bg-emerald-500/[0.08] border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-[#00e5a0] font-bold text-xs">
                              <Timer className="w-4 h-4 flex-shrink-0" />
                              <span>Completed in {durationText}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                              {formatDateDisplay(item.completedAt)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center text-[11px] text-slate-400 dark:text-[#64748b] gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Vaulted {timeAgo(item.createdAt)}</span>
                            {item.createdAt && (
                              <span className="opacity-75">({formatDateDisplay(item.createdAt)})</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Subtasks Section (Fully Visible & Scrollable for many tasks) */}
                      {hasTasks && (
                        <div className="mt-3 mb-3 bg-slate-50 dark:bg-[#0f131a] border border-slate-100 dark:border-[#1e2530] rounded-2xl p-3">
                          {/* Progress bar */}
                          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                            <span className="flex items-center gap-1.5 text-[11px]">
                              <ListTodo className="w-3.5 h-3.5 text-[#00e5a0]" />
                              Tasks ({completedTasksCount}/{totalTasksCount})
                            </span>
                            <span className="text-[11px] text-slate-400 font-semibold">{progressPct}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-[#1e2530] rounded-full h-1.5 mb-3 overflow-hidden">
                            <div
                              className="bg-[#00e5a0] h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>

                          {/* Scrollable Tasks List without truncation */}
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {tasksList.map((task, tIdx) => (
                              <div
                                key={tIdx}
                                onClick={() => handleToggleSubtask(item._id, tIdx)}
                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer group/task ${
                                  task.completed
                                    ? 'bg-slate-100/70 dark:bg-[#161b24] text-slate-400 dark:text-slate-500'
                                    : 'bg-white dark:bg-[#161b24] text-slate-700 dark:text-slate-200 hover:border-[#00e5a0]/50 border border-transparent'
                                }`}
                              >
                                <div className="flex items-center space-x-2 truncate">
                                  {task.completed ? (
                                    <CheckSquare className="w-3.5 h-3.5 text-emerald-500 dark:text-[#00e5a0] flex-shrink-0" />
                                  ) : (
                                    <Circle className="w-3.5 h-3.5 text-slate-400 group-hover/task:text-[#00e5a0] flex-shrink-0" />
                                  )}
                                  <span className={`truncate text-xs ${task.completed ? 'line-through' : 'font-medium'}`}>
                                    {task.text}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quick inline task adder on the card */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <input
                          type="text"
                          value={quickTaskInputs[item._id] || ''}
                          onChange={(e) =>
                            setQuickTaskInputs(prev => ({ ...prev, [item._id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddInlineSubtask(item._id);
                            }
                          }}
                          placeholder="+ Add task..."
                          className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-[#0a0c10] border border-slate-200 dark:border-[#1e2530] rounded-xl text-slate-800 dark:text-[#e2e8f0] focus:ring-1 focus:ring-[#00e5a0] outline-none text-xs placeholder-slate-400"
                        />
                        {(quickTaskInputs[item._id] || '').trim() && (
                          <button
                            type="button"
                            onClick={() => handleAddInlineSubtask(item._id)}
                            className="px-2.5 py-1.5 bg-[#00e5a0] hover:bg-[#00c98c] text-black font-extrabold rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            Add
                          </button>
                        )}
                      </div>

                      {/* Description / Notes (Expandable with full visibility) */}
                      {item.description && (
                        <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed bg-slate-50/70 dark:bg-[#0a0c10]/40 p-3 rounded-2xl border border-slate-100 dark:border-[#1e2530]">
                          <p className={`whitespace-pre-line ${isNoteExpanded ? '' : 'line-clamp-3'}`}>
                            {item.description}
                          </p>
                          {item.description.length > 120 && (
                            <button
                              type="button"
                              onClick={() => toggleExpandNote(item._id)}
                              className="mt-1.5 text-[11px] font-bold text-[#00e5a0] hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              {isNoteExpanded ? (
                                <>
                                  Show Less <ChevronUp className="w-3 h-3" />
                                </>
                              ) : (
                                <>
                                  Show Full Note <ChevronDown className="w-3 h-3" />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer Controls: Edit & Delete */}
                    <div className="pl-2 flex items-center justify-between border-t border-slate-100 dark:border-[#1e2530] pt-3 mt-4">
                      <div className="text-[10px] text-slate-400 dark:text-[#64748b]">
                        {item.updatedAt !== item.createdAt && (
                          <span>Updated {timeAgo(item.updatedAt)}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleStartEdit(item)}
                          className={`p-2 rounded-xl transition-all duration-150 cursor-pointer ${
                            editingId === item._id
                              ? 'bg-[#00e5a0]/20 text-[#00e5a0]'
                              : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1e2530] hover:text-[#00e5a0]'
                          }`}
                          title="Edit Vault"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-[#ff6b35] transition-colors cursor-pointer"
                          title="Delete Vault"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Backlog;
