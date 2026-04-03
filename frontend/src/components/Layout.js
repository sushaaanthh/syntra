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
        <Link to="/dashboard" className="flex items-center gap-3 group" data-testid="sidebar-logo">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow duration-300">
            <Lightning weight="fill" className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">Syntra</span>
        </Link>
        {mobile && (
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
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
              <Icon weight={isActive ? 'fill' : 'duotone'} className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 space-y-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 transition-all duration-200"
          data-testid="theme-toggle"
        >
          {theme === 'dark' ? (
            <Sun weight="duotone" className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon weight="duotone" className="w-5 h-5 text-indigo-500" />
          )}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* User info card */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold shadow-lg shadow-indigo-500/25">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200"
          data-testid="logout-button"
        >
          <SignOut weight="duotone" className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  if (mobile) {
    return sidebarContent;
  }

  return (
    <aside className="hidden lg:flex w-72 flex-col glass-sidebar">
      {sidebarContent}
    </aside>
  );
}

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/30 dark:from-[#08080c] dark:via-[#0c0a14] dark:to-[#080a10] -z-10" />
      <div className="fixed top-0 right-1/4 w-[600px] h-[600px] bg-indigo-400/5 dark:bg-indigo-500/5 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-violet-400/5 dark:bg-violet-500/5 rounded-full blur-3xl -z-10" />

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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-80 glass-sidebar z-50 lg:hidden shadow-2xl"
            >
              <Sidebar mobile onClose={() => setMobileMenuOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden glass-header sticky top-0 z-30 px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2.5 rounded-xl glass-card"
            data-testid="mobile-menu-button"
          >
            <List className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Lightning weight="fill" className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">Syntra</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
