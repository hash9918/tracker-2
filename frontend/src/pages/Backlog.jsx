import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { Pencil, Trash2, Plus, Search, Sparkles, Tag, AlertCircle } from 'lucide-react';

const COLORS = [
  '#00e5a0', // Cyan Green
  '#3b82f6', // Bright Blue
  '#a855f7', // Electric Purple
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#ec4899'  // Pink
];

const Backlog = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [editingId, setEditingId] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a title for your task');
      return;
    }

    try {
      if (editingId) {
        // Update existing item
        const response = await api.put(`/api/backlog/${editingId}`, {
          title: title.trim(),
          description: description.trim(),
          color: selectedColor
        });

        setItems(items.map(item => item._id === editingId ? response.data : item));
        setEditingId(null);
      } else {
        // Create new item
        const response = await api.post('/api/backlog', {
          title: title.trim(),
          description: description.trim(),
          color: selectedColor
        });

        setItems([response.data, ...items]);
      }

      // Reset form
      setTitle('');
      setDescription('');
      setSelectedColor(COLORS[0]);
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
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setSelectedColor(COLORS[0]);
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

  // Filter items by search query
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
              Future Vault
            </h1>
            <p className="text-sm text-slate-500 dark:text-[#64748b]">
              A safe space for ideas, goals, and tasks you want to tackle someday. No stress, no schedules.
            </p>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-[#ff6b35] p-4 rounded-2xl mb-6 text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl p-6 shadow-sm h-fit">
          <h3 className="text-lg font-bold text-slate-800 dark:text-[#e2e8f0] mb-5 flex items-center">
            {editingId ? (
              <>
                <Pencil className="w-5 h-5 mr-1.5 text-[#00e5a0]" />
                Edit Future Task
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-1.5 text-[#00e5a0]" />
                Add Future Task
              </>
            )}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-[#64748b] uppercase tracking-wider mb-2">
                Task Title
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-[#64748b]">
                  <Tag className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#0a0c10] border border-slate-200 dark:border-[#1e2530] rounded-2xl text-slate-800 dark:text-[#e2e8f0] focus:ring-2 focus:ring-[#00e5a0] outline-none"
                  placeholder="e.g. Master React Query"
                  required
                />
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
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0a0c10] border border-slate-200 dark:border-[#1e2530] rounded-2xl text-slate-800 dark:text-[#e2e8f0] focus:ring-2 focus:ring-[#00e5a0] outline-none h-28 resize-none"
                placeholder="Add some details or resources..."
              />
            </div>

            {/* Color Theme */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-[#64748b] uppercase tracking-wider mb-3">
                Select Theme Label
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

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 mt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#00e5a0] hover:bg-[#00c98c] text-black font-extrabold text-sm shadow-md transition-all duration-150 flex items-center justify-center"
              >
                {editingId ? (
                  <>
                    <Pencil className="w-4 h-4 mr-2 stroke-[3]" />
                    Save Changes
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
                  className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-[#1e2530] hover:bg-slate-200 dark:hover:bg-[#283141] text-slate-700 dark:text-slate-300 font-extrabold text-sm transition-all duration-150 flex items-center justify-center"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Task List Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-[#64748b]">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-2xl text-slate-800 dark:text-[#e2e8f0] focus:ring-2 focus:ring-[#00e5a0] outline-none shadow-sm placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="Search future tasks..."
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00e5a0]"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 dark:border-[#1e2530] rounded-3xl p-6 bg-white dark:bg-[#161b24] text-center">
              <Sparkles className="w-12 h-12 text-slate-300 dark:text-[#1e2530] mb-3" />
              <p className="text-base text-slate-500 dark:text-[#64748b]">No future tasks found.</p>
              <p className="text-xs text-slate-400 dark:text-[#64748b] mt-1">
                {searchQuery ? "Try searching for something else!" : "Use the builder form on the left to vault your first goal!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col justify-between p-5 bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-2xl shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-200 relative overflow-hidden group"
                >
                  {/* Left accent color bar */}
                  <div
                    className="absolute top-0 left-0 bottom-0 w-2.5"
                    style={{ backgroundColor: item.color || COLORS[0] }}
                  />

                  {/* Task details */}
                  <div className="pl-2 space-y-2 mb-4">
                    <h4 className="font-extrabold text-slate-800 dark:text-[#e2e8f0] text-lg leading-tight group-hover:text-[#00e5a0] transition-colors duration-150">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium line-clamp-3 leading-relaxed whitespace-pre-line">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="pl-2 flex items-center justify-end border-t border-slate-100 dark:border-[#1e2530] pt-3 mt-auto space-x-1.5">
                    <button
                      onClick={() => handleStartEdit(item)}
                      className={`p-2 rounded-xl transition-all duration-150 ${
                        editingId === item._id
                          ? 'bg-[#00e5a0]/20 text-[#00e5a0]'
                          : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1e2530] hover:text-[#00e5a0]'
                      }`}
                      title="Edit Goal"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-[#ff6b35] transition-colors"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Backlog;
