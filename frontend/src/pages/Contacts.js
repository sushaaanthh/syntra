import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MagnifyingGlass,
  Users,
  X,
  Pencil,
  Trash,
  Phone,
  Envelope,
  Buildings,
  Note
} from '@phosphor-icons/react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const statusOptions = ['Lead', 'Pending', 'Closed'];

const statusBadges = {
  Lead: 'badge-lead',
  Pending: 'badge-pending',
  Closed: 'badge-closed'
};

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'Lead',
    notes: ''
  });

  const fetchContacts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/contacts`, { withCredentials: true });
      setContacts(res.data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editContact) {
        await axios.put(`${API_URL}/api/contacts/${editContact.contact_id}`, formData, { withCredentials: true });
      } else {
        await axios.post(`${API_URL}/api/contacts`, formData, { withCredentials: true });
      }
      fetchContacts();
      closeModal();
    } catch (err) {
      console.error('Error saving contact:', err);
    }
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      await axios.delete(`${API_URL}/api/contacts/${contactId}`, { withCredentials: true });
      setContacts(contacts.filter(c => c.contact_id !== contactId));
    } catch (err) {
      console.error('Error deleting contact:', err);
    }
  };

  const openEditModal = (contact) => {
    setEditContact(contact);
    setFormData({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      status: contact.status || 'Lead',
      notes: contact.notes || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditContact(null);
    setFormData({ name: '', email: '', phone: '', company: '', status: 'Lead', notes: '' });
  };

  const filteredContacts = contacts.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 lg:p-10 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-8"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10" data-testid="contacts-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Contacts
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your leads and clients
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
          data-testid="add-contact-btn"
        >
          <Plus weight="bold" className="w-5 h-5 mr-2" />
          Add Contact
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-12"
          data-testid="contacts-search-input"
        />
      </div>

      {/* Contacts List */}
      <div className="card">
        {filteredContacts.length === 0 ? (
          <div className="p-10 text-center">
            <Users weight="duotone" className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
              {search ? 'No contacts found' : 'No contacts yet'}
            </p>
            {!search && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-primary-600 dark:text-primary-400 font-medium hover:underline"
              >
                Add your first contact
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredContacts.map((contact, index) => (
              <motion.div
                key={contact.contact_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                data-testid={`contact-${contact.contact_id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                    {contact.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 dark:text-white">{contact.name}</p>
                      <span className={`badge ${statusBadges[contact.status] || 'badge-lead'}`}>
                        {contact.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {contact.email && (
                        <span className="flex items-center gap-1">
                          <Envelope weight="regular" className="w-3.5 h-3.5" />
                          {contact.email}
                        </span>
                      )}
                      {contact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone weight="regular" className="w-3.5 h-3.5" />
                          {contact.phone}
                        </span>
                      )}
                      {contact.company && (
                        <span className="flex items-center gap-1">
                          <Buildings weight="regular" className="w-3.5 h-3.5" />
                          {contact.company}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(contact)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    data-testid={`edit-contact-${contact.contact_id}`}
                  >
                    <Pencil weight="regular" className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.contact_id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    data-testid={`delete-contact-${contact.contact_id}`}
                  >
                    <Trash weight="regular" className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
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
                  {editContact ? 'Edit Contact' : 'Add Contact'}
                </h3>
                <button onClick={closeModal} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="label">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="John Doe"
                    required
                    data-testid="contact-name-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input"
                      placeholder="john@example.com"
                      data-testid="contact-email-input"
                    />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input"
                      placeholder="+91 98765 43210"
                      data-testid="contact-phone-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Company</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="input"
                      placeholder="Acme Inc."
                      data-testid="contact-company-input"
                    />
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="input"
                      data-testid="contact-status-select"
                    >
                      {statusOptions.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input min-h-[80px]"
                    placeholder="Any notes about this contact..."
                    data-testid="contact-notes-input"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" data-testid="save-contact-btn">
                    {editContact ? 'Update' : 'Add'} Contact
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
