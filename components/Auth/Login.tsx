
import React, { useState } from 'react';
import { Pill, Mail, Lock, ChevronRight, User as UserIcon, Users, Eye, EyeOff, Loader2 } from 'lucide-react';
import { User, UserRole } from '../../types';
import { login, resetPassword } from '../../services/authService';

interface LoginProps {
  onLogin: (user: User, rememberMe: boolean) => void;
  onSwitchToSignup: () => void;
  onSkip?: (role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignup, onSkip }) => {
  const [role, setRole] = useState<UserRole>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetView, setShowResetView] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await login(email, password);
      onLogin(user, rememberMe);
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await resetPassword(email);
      setResetSuccess(true);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  if (showResetView) {
    return (
      <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto px-8 pt-20 pb-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[28px] flex items-center justify-center shadow-xl shadow-blue-100 mb-6 transform rotate-12">
            <Lock size={40} className="text-white -rotate-12" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-400 mt-2 text-center text-sm">
            {resetSuccess 
              ? "Check your email for the reset link." 
              : "Enter your email to receive a password reset link."}
          </p>
        </div>

        {resetSuccess ? (
          <div className="space-y-6">
            <div className="bg-emerald-50 text-emerald-600 p-6 rounded-[32px] text-sm font-medium border border-emerald-100 text-center">
              <p className="mb-2 font-bold text-base">Email Sent!</p>
              <p>We've sent a password reset link to <span className="font-bold">{email}</span>. Please check your inbox and follow the instructions.</p>
            </div>
            <button 
              onClick={() => { setShowResetView(false); setResetSuccess(false); setError(null); }}
              className="w-full bg-slate-100 text-gray-900 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1" htmlFor="reset-email">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  id="reset-email"
                  type="email" 
                  placeholder="Enter your registered email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : "Send Reset Link"}
            </button>

            <button 
              type="button"
              onClick={() => { setShowResetView(false); setError(null); }}
              className="w-full py-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto px-8 pt-20 pb-10">
      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[28px] flex items-center justify-center shadow-xl shadow-blue-100 mb-6 transform rotate-12">
          <Pill size={40} className="text-white -rotate-12" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome to PillCare</h1>
        <p className="text-gray-400 mt-2 text-center text-sm">Login to manage medications</p>
      </div>

      <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
        <button 
          type="button"
          onClick={() => setRole('patient')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${role === 'patient' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
        >
          <UserIcon size={18} />
          Patient
        </button>
        <button 
          type="button"
          onClick={() => setRole('caregiver')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${role === 'caregiver' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
        >
          <Users size={18} />
          Caregiver
        </button>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1" htmlFor="email">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              id="email"
              type="email" 
              placeholder="Enter your email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1" htmlFor="password">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              id="password"
              type={showPassword ? "text" : "password"} 
              placeholder="Enter your password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors p-1 flex items-center justify-center"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center px-1">
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
            <input 
              type="checkbox" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4" 
            />
            Remember me
          </label>
          <button 
            type="button" 
            onClick={() => setShowResetView(true)}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 mt-4 flex items-center justify-center gap-2 group active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100"
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              Login
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-auto text-center pt-8 space-y-4">
        <p className="text-gray-500 text-sm">
          Don't have an account? 
          <button onClick={onSwitchToSignup} className="text-blue-600 font-bold ml-1 hover:underline">Create Account</button>
        </p>
        
        {onSkip && (
          <button 
            onClick={() => onSkip(role)}
            className="text-gray-400 text-xs font-medium hover:text-gray-600 transition-colors uppercase tracking-widest"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
};

export default Login;
