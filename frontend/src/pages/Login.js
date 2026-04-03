import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Lightning, EnvelopeSimple, Lock, GoogleLogo, ArrowRight, Eye, EyeSlash, Moon, Sun, Sparkle } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

function formatApiErrorDetail(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/40 dark:from-[#0a0a12] dark:via-[#0f0a1a] dark:to-[#0a1015]" />
      
      {/* Decorative blurs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-400/20 dark:bg-violet-500/10 rounded-full blur-3xl" />
      
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 relative z-10">
        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-12"
          >
            <Link to="/" className="flex items-center gap-3 group" data-testid="login-logo">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow duration-300">
                <Lightning weight="fill" className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-2xl text-slate-900 dark:text-white tracking-tight">Syntra</span>
            </Link>
            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl glass-card hover:scale-105 transition-all duration-300"
              data-testid="login-theme-toggle"
            >
              {theme === 'dark' ? (
                <Sun weight="duotone" className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon weight="duotone" className="w-5 h-5 text-indigo-500" />
              )}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
              Welcome back
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg mb-10">
              Sign in to continue to your dashboard
            </p>

            {/* Google Login */}
            <button
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold
                       glass-card hover:bg-white/80 dark:hover:bg-white/10
                       text-slate-700 dark:text-slate-200
                       transition-all duration-300 hover:scale-[1.02] hover:shadow-lg mb-8"
              data-testid="google-login-btn"
            >
              <GoogleLogo weight="bold" className="w-5 h-5" />
              Continue with Google
            </button>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/60 dark:border-slate-700/60"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-sm font-medium text-slate-400 dark:text-slate-500 bg-transparent">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200/50 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm font-medium"
                  data-testid="login-error"
                >
                  {error}
                </motion.div>
              )}

              <div>
                <label htmlFor="email" className="label">Email address</label>
                <div className="relative">
                  <EnvelopeSimple weight="duotone" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-12"
                    placeholder="you@example.com"
                    required
                    data-testid="login-email-input"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="label">Password</label>
                <div className="relative">
                  <Lock weight="duotone" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-12 pr-12"
                    placeholder="Enter your password"
                    required
                    data-testid="login-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeSlash weight="duotone" className="w-5 h-5" /> : <Eye weight="duotone" className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-base"
                data-testid="login-submit-btn"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight weight="bold" className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors" data-testid="login-register-link">
                Create one
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700" />
        
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-64 h-64 border border-white/10 rounded-full" />
        <div className="absolute bottom-32 left-16 w-48 h-48 border border-white/10 rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/5 rounded-full blur-xl" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-md text-center relative z-10"
        >
          <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mx-auto mb-10 shadow-2xl">
            <Lightning weight="fill" className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">
            Automate your business
          </h2>
          <p className="text-indigo-100 text-lg leading-relaxed">
            Excel → Invoice → WhatsApp. All connected. All automatic. Built for Indian small businesses.
          </p>
          
          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {['GST Ready', 'WhatsApp', 'Excel Sync'].map((feature) => (
              <span key={feature} className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium">
                {feature}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
