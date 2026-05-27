import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ScheduleBuilder from './pages/ScheduleBuilder';
import HeatmapView from './pages/HeatmapView';
import Backlog from './pages/Backlog';
import HistoryReplay from './pages/HistoryReplay';
import WeeklyReview from './pages/WeeklyReview';

const App = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0c10] text-slate-800 dark:text-[#e2e8f0] font-sans transition-colors duration-300">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/schedule" element={<ScheduleBuilder />} />
            <Route path="/heatmap" element={<HeatmapView />} />
            <Route path="/backlog" element={<Backlog />} />
            <Route path="/history" element={<HistoryReplay />} />
            <Route path="/weekly" element={<WeeklyReview />} />
          </Route>

          {/* Fallback Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
