import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import {
  User,
  Moon,
  Sun,
  Buildings,
  EnvelopeSimple,
  DownloadSimple
} from '@phosphor-icons/react';

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-6 lg:p-10" data-testid="settings-page">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage your account and preferences
        </p>
      </motion.div>

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-8"
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Profile
          </h2>
          <div className="flex items-start gap-8">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-indigo-500/25">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-1">
                  <User weight="duotone" className="w-4 h-4" />
                  Name
                </label>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{user?.name || 'User'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-1">
                  <EnvelopeSimple weight="duotone" className="w-4 h-4" />
                  Email
                </label>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-1">
                  <Buildings weight="duotone" className="w-4 h-4" />
                  Role
                </label>
                <p className="text-lg font-semibold text-slate-900 dark:text-white capitalize">{user?.role || 'User'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-8"
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Appearance
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Theme</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Switch between light and dark mode
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 px-5 py-3 rounded-xl glass-card hover:scale-105 transition-all duration-300"
              data-testid="settings-theme-toggle"
            >
              {theme === 'dark' ? (
                <>
                  <Sun weight="duotone" className="w-5 h-5 text-amber-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Light</span>
                </>
              ) : (
                <>
                  <Moon weight="duotone" className="w-5 h-5 text-indigo-500" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Dark</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Business Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-8"
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Business Information
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Your business details will appear on invoices
          </p>
          <div className="space-y-5">
            <div>
              <label className="label">Business Name</label>
              <input type="text" className="input" placeholder="Your Business Name" data-testid="business-name-input" />
            </div>
            <div>
              <label className="label">GSTIN</label>
              <input type="text" className="input" placeholder="22AAAAA0000A1Z5" data-testid="business-gstin-input" />
            </div>
            <div>
              <label className="label">Address</label>
              <textarea className="input min-h-[100px]" placeholder="123 Business Park, City, State - PIN" data-testid="business-address-input" />
            </div>
            <button className="btn-primary" data-testid="save-business-btn">
              Save Changes
            </button>
          </div>
        </motion.div>

        {/* Data Export */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-8"
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Data & Export
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Export your data or manage your account
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="btn-secondary" data-testid="export-contacts-btn">
              <DownloadSimple weight="bold" className="w-4 h-4 mr-2" />
              Export Contacts
            </button>
            <button className="btn-secondary" data-testid="export-invoices-btn">
              <DownloadSimple weight="bold" className="w-4 h-4 mr-2" />
              Export Invoices
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
