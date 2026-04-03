import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Lightning, EnvelopeSimple, Lock, GoogleLogo, ArrowRight, Eye, EyeSlash, Moon, Sun } from '@phosphor-icons/react';
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
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20">
        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <Link to="/" className="flex items-center gap-3" data-testid="login-logo">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-soft">
                <Lightning weight="fill" className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-slate-900 dark:text-white">Syntra</span>
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              data-testid="login-theme-toggle"
            >
              {theme === 'dark' ? (
                <Sun weight="regular" className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              ) : (
                <Moon weight="regular" className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              )}
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="font-heading text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome back
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Sign in to continue to your dashboard
            </p>

            {/* Google Login */}
            <button
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl font-medium
                       bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                       text-slate-700 dark:text-slate-200
                       hover:bg-slate-50 dark:hover:bg-slate-700
                       transition-all duration-200 mb-6"
              data-testid="google-login-btn"
            >
              <GoogleLogo weight="bold" className="w-5 h-5" />
              Continue with Google
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background-light dark:bg-background-dark text-slate-500 dark:text-slate-400">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm" data-testid="login-error">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="label">Email</label>
                <div className="relative">
                  <EnvelopeSimple className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
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
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeSlash className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5"
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

            <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary-600 dark:text-primary-400 hover:underline" data-testid="login-register-link">
                Create one
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-500 to-primary-700 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center mx-auto mb-8">
            <Lightning weight="fill" className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-heading text-3xl font-bold text-white mb-4">
            Automate your business
          </h2>
          <p className="text-primary-100 text-lg leading-relaxed">
            Excel → Invoice → WhatsApp. All connected. All automatic. Built for Indian small businesses.
          </p>
        </div>
      </div>
    </div>
  );
}
