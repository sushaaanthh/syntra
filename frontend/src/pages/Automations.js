import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Lightning,
  X,
  Play,
  Pause,
  Trash,
  Users,
  Receipt,
  WhatsappLogo,
  ArrowRight,
  Sparkle
} from '@phosphor-icons/react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const triggerTypes = [
  { value: 'new_row', label: 'When new row is added', icon: Plus },
  { value: 'row_updated', label: 'When row is updated', icon: Lightning },
  { value: 'status_change', label: 'When status changes', icon: Lightning }
];

const actionTypes = [
  { value: 'create_invoice', label: 'Create Invoice', icon: Receipt },
  { value: 'update_crm', label: 'Update CRM Contact', icon: Users },
  { value: 'send_whatsapp', label: 'Send WhatsApp Message', icon: WhatsappLogo }
];

export default function Automations() {
  const [automations, setAutomations] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    trigger_type: 'new_row',
    action_type: 'create_invoice',
    is_active: true
  });

  const fetchData = useCallback(async () => {
    try {
      const [autoRes, templatesRes] = await Promise.all([
        axios.get(`${API_URL}/api/automations`, { withCredentials: true }),
        axios.get(`${API_URL}/api/templates`, { withCredentials: true })
      ]);
      setAutomations(autoRes.data);
      setTemplates(templatesRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/automations`, formData, { withCredentials: true });
      fetchData();
      closeModal();
    } catch (err) {
      console.error('Error creating automation:', err);
    }
  };

  const handleToggle = async (automationId) => {
    try {
      const res = await axios.put(`${API_URL}/api/automations/${automationId}/toggle`, {}, { withCredentials: true });
      setAutomations(automations.map(a =>
        a.automation_id === automationId ? { ...a, is_active: res.data.is_active } : a
      ));
    } catch (err) {
      console.error('Error toggling automation:', err);
    }
  };

  const handleRun = async (automationId) => {
    try {
      await axios.post(`${API_URL}/api/automations/${automationId}/run`, {}, { withCredentials: true });
      fetchData();
    } catch (err) {
      console.error('Error running automation:', err);
    }
  };

  const handleDelete = async (automationId) => {
    if (!window.confirm('Are you sure you want to delete this automation?')) return;
    try {
      await axios.delete(`${API_URL}/api/automations/${automationId}`, { withCredentials: true });
      setAutomations(automations.filter(a => a.automation_id !== automationId));
    } catch (err) {
      console.error('Error deleting automation:', err);
    }
  };

  const useTemplate = (template) => {
    setFormData({
      name: template.name,
      trigger_type: template.trigger_type,
      action_type: template.action_type,
      is_active: true
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: '', trigger_type: 'new_row', action_type: 'create_invoice', is_active: true });
  };

  const getTriggerLabel = (type) => triggerTypes.find(t => t.value === type)?.label || type;
  const getActionLabel = (type) => actionTypes.find(a => a.value === type)?.label || type;
  const getActionIcon = (type) => actionTypes.find(a => a.value === type)?.icon || Lightning;

  if (loading) {
    return (
      <div className="p-6 lg:p-10 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-8"></div>
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10" data-testid="automations-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Automations
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            "When this happens → Do this" — simple rules, powerful results
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
          data-testid="create-automation-btn"
        >
          <Plus weight="bold" className="w-5 h-5 mr-2" />
          New Automation
        </button>
      </div>

      {/* Templates */}
      {templates.length > 0 && automations.length === 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkle weight="fill" className="w-5 h-5 text-amber-500" />
            <h2 className="font-heading font-semibold text-slate-900 dark:text-white">
              Quick Start Templates
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((template) => {
              const Icon = actionTypes.find(a => a.value === template.action_type)?.icon || Lightning;
              return (
                <motion.button
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => useTemplate(template)}
                  className="card-hover p-5 text-left"
                  data-testid={`template-${template.id}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3">
                    <Icon weight="duotone" className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="font-medium text-slate-900 dark:text-white mb-1">{template.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{template.description}</p>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Automations List */}
      <div className="card">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-heading font-semibold text-slate-900 dark:text-white">
            Your Automations
          </h2>
        </div>

        {automations.length === 0 ? (
          <div className="p-10 text-center">
            <Lightning weight="duotone" className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No automations yet</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">Create your first automation or use a template above</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
            >
              Create automation
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {automations.map((automation, index) => {
              const ActionIcon = getActionIcon(automation.action_type);
              return (
                <motion.div
                  key={automation.automation_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  data-testid={`automation-${automation.automation_id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${automation.is_active ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      <ActionIcon weight="duotone" className={`w-5 h-5 ${automation.is_active ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900 dark:text-white">{automation.name}</p>
                        <span className={`badge ${automation.is_active ? 'badge-active' : 'badge-inactive'}`}>
                          {automation.is_active ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{getTriggerLabel(automation.trigger_type)}</span>
                        <ArrowRight weight="bold" className="w-3 h-3" />
                        <span>{getActionLabel(automation.action_type)}</span>
                        {automation.run_count > 0 && (
                          <span className="ml-2">· {automation.run_count} runs</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRun(automation.automation_id)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Run now"
                      data-testid={`run-automation-${automation.automation_id}`}
                    >
                      <Play weight="fill" className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </button>
                    <button
                      onClick={() => handleToggle(automation.automation_id)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title={automation.is_active ? 'Pause' : 'Activate'}
                      data-testid={`toggle-automation-${automation.automation_id}`}
                    >
                      {automation.is_active ? (
                        <Pause weight="fill" className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <Play weight="fill" className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(automation.automation_id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      data-testid={`delete-automation-${automation.automation_id}`}
                    >
                      <Trash weight="regular" className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-lifted max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-white">
                  New Automation
                </h3>
                <button onClick={closeModal} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-5">
                <div>
                  <label className="label">Automation Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="New sale notification"
                    required
                    data-testid="automation-name-input"
                  />
                </div>

                <div>
                  <label className="label">When this happens...</label>
                  <div className="space-y-2">
                    {triggerTypes.map((trigger) => (
                      <label
                        key={trigger.value}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formData.trigger_type === trigger.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                      >
                        <input
                          type="radio"
                          name="trigger_type"
                          value={trigger.value}
                          checked={formData.trigger_type === trigger.value}
                          onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value })}
                          className="sr-only"
                        />
                        <trigger.icon weight="duotone" className={`w-5 h-5 ${formData.trigger_type === trigger.value ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`} />
                        <span className={`text-sm font-medium ${formData.trigger_type === trigger.value ? 'text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-slate-300'}`}>
                          {trigger.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Do this...</label>
                  <div className="space-y-2">
                    {actionTypes.map((action) => (
                      <label
                        key={action.value}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formData.action_type === action.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                      >
                        <input
                          type="radio"
                          name="action_type"
                          value={action.value}
                          checked={formData.action_type === action.value}
                          onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}
                          className="sr-only"
                        />
                        <action.icon weight="duotone" className={`w-5 h-5 ${formData.action_type === action.value ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`} />
                        <span className={`text-sm font-medium ${formData.action_type === action.value ? 'text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-slate-300'}`}>
                          {action.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" data-testid="save-automation-btn">
                    Create Automation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
