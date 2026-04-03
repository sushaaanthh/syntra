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
  Envelope,
  WhatsappLogo
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
  user_registered: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  excel_uploaded: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  contact_created: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  invoice_created: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  automation_created: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
  automation_run: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
  whatsapp_sent: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
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
    { label: 'Total Contacts', value: stats.contacts, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Invoices', value: stats.invoices, icon: Receipt, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Active Automations', value: stats.active_automations, icon: Lightning, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-100 dark:bg-primary-900/30' },
    { label: 'Total Revenue', value: `₹${stats.total_revenue.toLocaleString('en-IN')}`, icon: CurrencyInr, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
  ] : [];

  if (loading) {
    return (
      <div className="p-6 lg:p-10 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10" data-testid="dashboard-page">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome back, {user?.name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="stat-card"
            data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, '-')}`}
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon weight="duotone" className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-heading font-bold text-slate-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-heading text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <Link
                to="/excel"
                className="flex flex-col items-center gap-3 p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group"
                data-testid="quick-action-excel"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Table weight="duotone" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-medium text-slate-700 dark:text-slate-300">Upload Excel</span>
              </Link>
              
              <Link
                to="/invoices"
                className="flex flex-col items-center gap-3 p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group"
                data-testid="quick-action-invoice"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Receipt weight="duotone" className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="font-medium text-slate-700 dark:text-slate-300">Create Invoice</span>
              </Link>
              
              <Link
                to="/automations"
                className="flex flex-col items-center gap-3 p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group"
                data-testid="quick-action-automation"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Lightning weight="duotone" className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <span className="font-medium text-slate-700 dark:text-slate-300">New Automation</span>
              </Link>
            </div>
          </div>

          {/* Pending Actions */}
          {stats && (stats.pending_invoices > 0 || stats.leads > 0) && (
            <div className="card p-6">
              <h2 className="font-heading text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Needs Attention
              </h2>
              <div className="space-y-3">
                {stats.pending_invoices > 0 && (
                  <Link
                    to="/invoices"
                    className="flex items-center justify-between p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 hover:border-orange-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ClockCountdown weight="duotone" className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <span className="text-slate-700 dark:text-slate-300">
                        <strong>{stats.pending_invoices}</strong> pending invoice{stats.pending_invoices > 1 ? 's' : ''}
                      </span>
                    </div>
                    <ArrowRight weight="bold" className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </Link>
                )}
                {stats.leads > 0 && (
                  <Link
                    to="/contacts"
                    className="flex items-center justify-between p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 hover:border-amber-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Users weight="duotone" className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <span className="text-slate-700 dark:text-slate-300">
                        <strong>{stats.leads}</strong> lead{stats.leads > 1 ? 's' : ''} to follow up
                      </span>
                    </div>
                    <ArrowRight weight="bold" className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="card p-6">
          <h2 className="font-heading text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          {activities.length === 0 ? (
            <div className="text-center py-10">
              <ChartLineUp weight="duotone" className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No activity yet</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">Upload an Excel file to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const Icon = activityIcons[activity.type] || Check;
                const colorClass = activityColors[activity.type] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
                return (
                  <motion.div
                    key={activity.activity_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-start gap-3"
                    data-testid={`activity-${activity.activity_id}`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}>
                      <Icon weight="bold" className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">
                        {activity.message}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {formatTimeAgo(activity.created_at)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
