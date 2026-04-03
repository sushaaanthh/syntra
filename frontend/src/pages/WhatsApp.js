import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  WhatsappLogo,
  PaperPlaneTilt,
  Clock,
  Check,
  User,
  X
} from '@phosphor-icons/react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function WhatsApp() {
  const [contacts, setContacts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [contactsRes, templatesRes, historyRes] = await Promise.all([
        axios.get(`${API_URL}/api/contacts`, { withCredentials: true }),
        axios.get(`${API_URL}/api/whatsapp/templates`, { withCredentials: true }),
        axios.get(`${API_URL}/api/whatsapp/history`, { withCredentials: true })
      ]);
      setContacts(contactsRes.data);
      setTemplates(templatesRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSend = async () => {
    if (!selectedContact || !selectedTemplate) return;

    setSending(true);
    try {
      await axios.post(`${API_URL}/api/whatsapp/send`, {
        contact_id: selectedContact.contact_id,
        template: selectedTemplate,
        custom_message: customMessage
      }, { withCredentials: true });
      
      setSuccess(`Message sent to ${selectedContact.name}`);
      fetchData();
      closeModal();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const openSendModal = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedContact(null);
    setSelectedTemplate('');
    setCustomMessage('');
  };

  const getTemplateMessage = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    return template?.message || '';
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-10 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-8"></div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10" data-testid="whatsapp-page">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">
          WhatsApp Messages
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Send notifications and reminders to your clients (simulated)
        </p>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3"
          >
            <Check weight="bold" className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-400">{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Contacts to Message */}
        <div className="card">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-heading font-semibold text-slate-900 dark:text-white">
              Send Message
            </h2>
          </div>
          
          {contacts.length === 0 ? (
            <div className="p-10 text-center">
              <User weight="duotone" className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No contacts yet</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">Add contacts first to send messages</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-[400px] overflow-y-auto">
              {contacts.map((contact) => (
                <div
                  key={contact.contact_id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                      {contact.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{contact.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{contact.phone || 'No phone'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openSendModal(contact)}
                    disabled={!contact.phone}
                    className="btn-primary py-2 px-4 text-sm disabled:opacity-50"
                    data-testid={`send-whatsapp-${contact.contact_id}`}
                  >
                    <WhatsappLogo weight="fill" className="w-4 h-4 mr-2" />
                    Send
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message History */}
        <div className="card">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-heading font-semibold text-slate-900 dark:text-white">
              Recent Messages
            </h2>
          </div>
          
          {history.length === 0 ? (
            <div className="p-10 text-center">
              <Clock weight="duotone" className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No messages sent yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-[400px] overflow-y-auto">
              {history.map((msg) => (
                <div
                  key={msg.message_id}
                  className="p-4 flex items-start gap-3"
                  data-testid={`message-history-${msg.message_id}`}
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <WhatsappLogo weight="fill" className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 dark:text-white">{msg.contact_name}</p>
                      <span className="badge badge-active">
                        <Check weight="bold" className="w-3 h-3 mr-1" />
                        Sent
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Template: {msg.template}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {new Date(msg.sent_at).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Templates Preview */}
      <div className="card mt-6">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-heading font-semibold text-slate-900 dark:text-white">
            Message Templates
          </h2>
        </div>
        <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <p className="font-medium text-slate-900 dark:text-white mb-2">{template.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">{template.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Send Modal */}
      <AnimatePresence>
        {showModal && selectedContact && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-lifted max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                    {selectedContact.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-slate-900 dark:text-white">
                      {selectedContact.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{selectedContact.phone}</p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="label">Select Template *</label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="input"
                    data-testid="whatsapp-template-select"
                  >
                    <option value="">Choose a template...</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {selectedTemplate && (
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-300 leading-relaxed">
                      {getTemplateMessage()}
                    </p>
                  </div>
                )}

                <div>
                  <label className="label">Additional Note (optional)</label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="input min-h-[80px]"
                    placeholder="Add a personal note..."
                    data-testid="whatsapp-custom-message"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="btn-secondary">
                    Cancel
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!selectedTemplate || sending}
                    className="btn-primary bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    data-testid="send-whatsapp-btn"
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <PaperPlaneTilt weight="fill" className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
