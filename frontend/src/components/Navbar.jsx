import React, { useContext, useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sun, Moon, LogOut, Calendar, LayoutDashboard, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#161b24]/80 dark:bg-[#161b24]/80 backdrop-blur-md border-b border-[#e2e8f0] dark:border-[#1e2530] text-[#0f172a] dark:text-[#e2e8f0] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#00e5a0] to-[#00bc7f] bg-clip-text text-transparent flex items-center">
                Tracker <span className="ml-1 text-lg">🔥</span>
              </span>
            </Link>
          </div>

          {/* Nav Links (Only if Logged In) */}
          {user && (
            <div className="hidden md:flex space-x-1">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-[#00e5a0]/10 text-[#00e5a0] border border-[#00e5a0]/20'
                    : 'hover:bg-slate-100 dark:hover:bg-[#1e2530] text-slate-600 dark:text-slate-400'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </NavLink>

              <NavLink
                to="/schedule"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-[#00e5a0]/10 text-[#00e5a0] border border-[#00e5a0]/20'
                    : 'hover:bg-slate-100 dark:hover:bg-[#1e2530] text-slate-600 dark:text-slate-400'
                  }`
                }
              >
                <Settings className="w-4 h-4 mr-2" />
                Schedule
              </NavLink>

              <NavLink
                to="/heatmap"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-[#00e5a0]/10 text-[#00e5a0] border border-[#00e5a0]/20'
                    : 'hover:bg-slate-100 dark:hover:bg-[#1e2530] text-slate-600 dark:text-slate-400'
                  }`
                }
              >
                <Calendar className="w-4 h-4 mr-2" />
                Heatmap
              </NavLink>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-[#1e2530] hover:bg-slate-100 dark:hover:bg-[#1e2530] transition-colors duration-200 text-slate-600 dark:text-slate-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                <span className="hidden sm:inline-block text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#1e2530] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1e2530]">
                  👤 {user.name}
                </span>

                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-[#ff6b35] hover:bg-[#e05623] text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-[#1e2530] hover:bg-slate-100 dark:hover:bg-[#1e2530] transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#00e5a0] hover:bg-[#00c98c] text-black transition-colors duration-200 shadow"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Nav Links (Only if Logged In) */}
        {user && (
          <div className="flex md:hidden justify-around pb-3 border-t border-slate-200 dark:border-[#1e2530] pt-2">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${isActive ? 'bg-[#00e5a0]/10 text-[#00e5a0]' : 'text-slate-600 dark:text-slate-400'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/schedule"
              className={({ isActive }) =>
                `flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${isActive ? 'bg-[#00e5a0]/10 text-[#00e5a0]' : 'text-slate-600 dark:text-slate-400'
                }`
              }
            >
              Schedule
            </NavLink>
            <NavLink
              to="/heatmap"
              className={({ isActive }) =>
                `flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${isActive ? 'bg-[#00e5a0]/10 text-[#00e5a0]' : 'text-slate-600 dark:text-slate-400'
                }`
              }
            >
              Heatmap
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
