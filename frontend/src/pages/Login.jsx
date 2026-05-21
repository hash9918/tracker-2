import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="w-full max-w-md bg-white dark:bg-[#161b24] border border-slate-200 dark:border-[#1e2530] rounded-3xl p-8 shadow-2xl transition-all duration-300 transform hover:scale-[1.01]">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-[#00e5a0]/10 rounded-2xl mb-3">
            <LogIn className="w-8 h-8 text-[#00e5a0]" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-[#e2e8f0]">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-500 dark:text-[#64748b] mt-1">
            Log in to continue building consistency
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-[#ff6b35] p-4 rounded-2xl mb-6 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-[#64748b] uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-[#64748b]">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#0a0c10] border border-slate-200 dark:border-[#1e2530] rounded-2xl text-slate-800 dark:text-[#e2e8f0] focus:ring-2 focus:ring-[#00e5a0] focus:border-[#00e5a0] outline-none transition-all"
                placeholder="example@study.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-[#64748b] uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-[#64748b]">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-[#0a0c10] border border-slate-200 dark:border-[#1e2530] rounded-2xl text-slate-800 dark:text-[#e2e8f0] focus:ring-2 focus:ring-[#00e5a0] focus:border-[#00e5a0] outline-none transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 dark:text-[#64748b] hover:text-[#00e5a0]"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-[#00e5a0] hover:bg-[#00c98c] text-black font-extrabold text-base shadow-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Logging in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500 dark:text-[#64748b]">
            New to StudyTracker?{' '}
            <Link to="/register" className="text-[#00e5a0] hover:underline font-semibold">
              Create an account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
