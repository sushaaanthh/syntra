import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  User,
  Moon,
  Sun,
  Buildings,
  EnvelopeSimple
} from '@phosphor-icons/react';

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-6 lg:p-10" data-testid="settings-page">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your account and preferences
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <div className="card p-6">
          <h2 className="font-heading font-semibold text-slate-900 dark:text-white mb-4">
            Profile
          </h2>
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <User weight="regular" className="w-4 h-4" />
                  Name
                </label>
                <p className="font-medium text-slate-900 dark:text-white">{user?.name || 'User'}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <EnvelopeSimple weight="regular" className="w-4 h-4" />
                  Email
                </label>
                <p className="font-medium text-slate-900 dark:text-white">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Buildings weight="regular" className="w-4 h-4" />
                  Role
                </label>
                <p className="font-medium text-slate-900 dark:text-white capitalize">{user?.role || 'User'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="card p-6">
          <h2 className="font-heading font-semibold text-slate-900 dark:text-white mb-4">
            Appearance
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Theme</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Switch between light and dark mode
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              data-testid="settings-theme-toggle"
            >
              {theme === 'dark' ? (
                <>
                  <Sun weight="duotone" className="w-5 h-5 text-amber-500" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">Light</span>
                </>
              ) : (
                <>
                  <Moon weight="duotone" className="w-5 h-5 text-primary-500" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Business Info (Placeholder) */}
        <div className="card p-6">
          <h2 className="font-heading font-semibold text-slate-900 dark:text-white mb-4">
            Business Information
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Your business details will appear on invoices
          </p>
          <div className="space-y-4">
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
              <textarea className="input min-h-[80px]" placeholder="123 Business Park, City, State - PIN" data-testid="business-address-input" />
            </div>
            <button className="btn-primary" data-testid="save-business-btn">
              Save Changes
            </button>
          </div>
        </div>

        {/* Data Export */}
        <div className="card p-6">
          <h2 className="font-heading font-semibold text-slate-900 dark:text-white mb-4">
            Data & Export
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Export your data or manage your account
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="btn-secondary" data-testid="export-contacts-btn">
              Export Contacts
            </button>
            <button className="btn-secondary" data-testid="export-invoices-btn">
              Export Invoices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
