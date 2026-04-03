import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  House, 
  Table, 
  Users, 
  Receipt, 
  Lightning, 
  WhatsappLogo, 
  Gear, 
  SignOut,
  Moon,
  Sun,
  List,
  X
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: House },
  { path: '/excel', label: 'Excel Sync', icon: Table },
  { path: '/contacts', label: 'Contacts', icon: Users },
  { path: '/invoices', label: 'Invoices', icon: Receipt },
  { path: '/automations', label: 'Automations', icon: Lightning },
  { path: '/whatsapp', label: 'WhatsApp', icon: WhatsappLogo },
  { path: '/settings', label: 'Settings', icon: Gear },
];

function Sidebar({ mobile = false, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3" data-testid="sidebar-logo">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-soft">
            <Lightning weight="fill" className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-bold text-xl text-slate-900 dark:text-white">Syntra</span>
        </Link>
        {mobile && (
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={mobile ? onClose : undefined}
              className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
              data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              <Icon weight={isActive ? 'fill' : 'regular'} className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          data-testid="theme-toggle"
        >
          {theme === 'dark' ? (
            <Sun weight="regular" className="w-5 h-5" />
          ) : (
            <Moon weight="regular" className="w-5 h-5" />
          )}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium text-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          data-testid="logout-button"
        >
          <SignOut weight="regular" className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  if (mobile) {
    return sidebarContent;
  }

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {sidebarContent}
    </aside>
  );
}

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 z-50 lg:hidden shadow-lifted"
            >
              <Sidebar mobile onClose={() => setMobileMenuOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden glass-header sticky top-0 z-30 px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            data-testid="mobile-menu-button"
          >
            <List className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <Lightning weight="fill" className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg text-slate-900 dark:text-white">Syntra</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
