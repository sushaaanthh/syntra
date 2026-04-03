import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  Users,
  Receipt,
  Lightning,
  CurrencyInr,
  ClockCountdown,
  ChartLineUp,
  Table,
  ArrowRight,
  Check,
  WhatsappLogo,
  Sparkle
} from '@phosphor-icons/react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const activityIcons = {
  user_registered: Check,
  excel_uploaded: Table,
  contact_created: Users,
  invoice_created: Receipt,
  automation_created: Lightning,
  automation_run: Lightning,
  whatsapp_sent: WhatsappLogo
};

const activityColors = {
  user_registered: 'from-emerald-500 to-teal-500',
  excel_uploaded: 'from-blue-500 to-cyan-500',
  contact_created: 'from-amber-500 to-orange-500',
  invoice_created: 'from-violet-500 to-purple-500',
  automation_created: 'from-indigo-500 to-violet-500',
  automation_run: 'from-indigo-500 to-violet-500',
  whatsapp_sent: 'from-emerald-500 to-green-500'
};

function formatTimeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function LoadingState() {
  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="h-10 w-64 rounded-xl shimmer" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-36 rounded-2xl shimmer" />
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activitiesRes] = await Promise.all([
          axios.get(`${API_URL}/api/dashboard/stats`, { withCredentials: true }),
          axios.get(`${API_URL}/api/activities?limit=10`, { withCredentials: true })
        ]);
        setStats(statsRes.data);
        setActivities(activitiesRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = stats ? [
    { label: 'Total Contacts', value: stats.contacts, icon: Users, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Invoices', value: stats.invoices, icon: Receipt, gradient: 'from-violet-500 to-purple-500' },
    { label: 'Active Automations', value: stats.active_automations, icon: Lightning, gradient: 'from-indigo-500 to-violet-500' },
    { label: 'Total Revenue', value: `₹${stats.total_revenue.toLocaleString('en-IN')}`, icon: CurrencyInr, gradient: 'from-emerald-500 to-teal-500' },
  ] : [];

  if (loading) return <LoadingState />;

  return (
    <div className="p-6 lg:p-10" data-testid="dashboard-page">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-2">
          <Sparkle weight="fill" className="w-6 h-6 text-amber-500" />
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Welcome back</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
          Hey, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
          Here's what's happening with your business today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="stat-card group"
            data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, '-')}`}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon weight="fill" className="w-6 h-6 text-white" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
              Quick Actions
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { to: '/excel', icon: Table, label: 'Upload Excel', gradient: 'from-blue-500 to-cyan-500' },
                { to: '/invoices', icon: Receipt, label: 'Create Invoice', gradient: 'from-violet-500 to-purple-500' },
                { to: '/automations', icon: Lightning, label: 'New Automation', gradient: 'from-indigo-500 to-violet-500' }
              ].map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex flex-col items-center gap-4 p-6 rounded-2xl glass-card hover:scale-[1.02] transition-all duration-300 group"
                  data-testid={`quick-action-${action.label.toLowerCase().replace(' ', '-')}`}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    <action.icon weight="fill" className="w-7 h-7 text-white" />
                  </div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{action.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Pending Actions */}
          {stats && (stats.pending_invoices > 0 || stats.leads > 0) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-6"
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5 tracking-tight">
                Needs Attention
              </h2>
              <div className="space-y-3">
                {stats.pending_invoices > 0 && (
                  <Link
                    to="/invoices"
                    className="flex items-center justify-between p-4 rounded-xl bg-orange-50/80 dark:bg-orange-900/10 border border-orange-200/50 dark:border-orange-800/30 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                        <ClockCountdown weight="fill" className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        <strong className="text-slate-900 dark:text-white">{stats.pending_invoices}</strong> pending invoice{stats.pending_invoices > 1 ? 's' : ''}
                      </span>
                    </div>
                    <ArrowRight weight="bold" className="w-5 h-5 text-orange-500 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
                {stats.leads > 0 && (
                  <Link
                    to="/contacts"
                    className="flex items-center justify-between p-4 rounded-xl bg-amber-50/80 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                        <Users weight="fill" className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        <strong className="text-slate-900 dark:text-white">{stats.leads}</strong> lead{stats.leads > 1 ? 's' : ''} to follow up
                      </span>
                    </div>
                    <ArrowRight weight="bold" className="w-5 h-5 text-amber-500 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Activity Feed */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6"
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
            Recent Activity
          </h2>
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <ChartLineUp weight="duotone" className="w-8 h-8 text-slate-400" />
              </div>
              <p className="font-medium text-slate-500 dark:text-slate-400">No activity yet</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Upload an Excel file to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const Icon = activityIcons[activity.type] || Check;
                const gradient = activityColors[activity.type] || 'from-slate-500 to-slate-600';
                return (
                  <motion.div
                    key={activity.activity_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-start gap-4"
                    data-testid={`activity-${activity.activity_id}`}
                  >
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <Icon weight="bold" className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug">
                        {activity.message}
                      </p>
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                        {formatTimeAgo(activity.created_at)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
