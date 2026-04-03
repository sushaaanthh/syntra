import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Receipt,
  X,
  Eye,
  DownloadSimple,
  Trash,
  CurrencyInr,
  Check,
  Clock,
  Warning
} from '@phosphor-icons/react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const statusBadges = {
  pending: 'badge-pending',
  paid: 'badge-closed',
  cancelled: 'badge-inactive'
};

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_gstin: '',
    client_address: '',
    tax_type: 'intra',
    due_date: '',
    notes: '',
    items: [{ name: '', quantity: 1, price: 0 }]
  });

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/invoices`, { withCredentials: true });
      setInvoices(res.data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', quantity: 1, price: 0 }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index)
      });
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'quantity' || field === 'price' ? parseFloat(value) || 0 : value;
    setFormData({ ...formData, items: newItems });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    if (formData.tax_type === 'inter') {
      return { igst: subtotal * 0.18, cgst: 0, sgst: 0 };
    }
    return { igst: 0, cgst: subtotal * 0.09, sgst: subtotal * 0.09 };
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    return subtotal + tax.igst + tax.cgst + tax.sgst;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.items.some(item => !item.name || item.price <= 0)) {
      setError('Please fill in all item details');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/invoices`, formData, { withCredentials: true });
      fetchInvoices();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create invoice');
    }
  };

  const handleDownloadPdf = async (invoiceId) => {
    try {
      const response = await axios.get(`${API_URL}/api/invoices/${invoiceId}/pdf`, {
        withCredentials: true,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading PDF:', err);
    }
  };

  const handleViewInvoice = async (invoiceId) => {
    try {
      const res = await axios.get(`${API_URL}/api/invoices/${invoiceId}`, { withCredentials: true });
      setViewInvoice(res.data);
    } catch (err) {
      console.error('Error fetching invoice:', err);
    }
  };

  const handleStatusChange = async (invoiceId, status) => {
    try {
      await axios.put(`${API_URL}/api/invoices/${invoiceId}/status`, { status }, { withCredentials: true });
      fetchInvoices();
      if (viewInvoice?.invoice_id === invoiceId) {
        setViewInvoice({ ...viewInvoice, status });
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setError('');
    setFormData({
      client_name: '',
      client_email: '',
      client_phone: '',
      client_gstin: '',
      client_address: '',
      tax_type: 'intra',
      due_date: '',
      notes: '',
      items: [{ name: '', quantity: 1, price: 0 }]
    });
  };

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
    <div className="p-6 lg:p-10" data-testid="invoices-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Invoices
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Generate GST-ready invoices with one click
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
          data-testid="create-invoice-btn"
        >
          <Plus weight="bold" className="w-5 h-5 mr-2" />
          Create Invoice
        </button>
      </div>

      {/* Invoices List */}
      <div className="card">
        {invoices.length === 0 ? (
          <div className="p-10 text-center">
            <Receipt weight="duotone" className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No invoices yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-primary-600 dark:text-primary-400 font-medium hover:underline"
            >
              Create your first invoice
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {invoices.map((invoice, index) => (
              <motion.div
                key={invoice.invoice_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                data-testid={`invoice-${invoice.invoice_id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Receipt weight="duotone" className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 dark:text-white">{invoice.invoice_number}</p>
                      <span className={`badge ${statusBadges[invoice.status] || 'badge-pending'}`}>
                        {invoice.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {invoice.client_name} · ₹{invoice.total_amount?.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewInvoice(invoice.invoice_id)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    data-testid={`view-invoice-${invoice.invoice_id}`}
                  >
                    <Eye weight="regular" className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleDownloadPdf(invoice.invoice_id)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    data-testid={`download-invoice-${invoice.invoice_id}`}
                  >
                    <DownloadSimple weight="regular" className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={closeModal}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-lifted max-w-2xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-white">
                  Create Invoice
                </h3>
                <button onClick={closeModal} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
                    <Warning weight="bold" className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Client Name *</label>
                    <input
                      type="text"
                      value={formData.client_name}
                      onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      className="input"
                      placeholder="Acme Corp"
                      required
                      data-testid="invoice-client-name"
                    />
                  </div>
                  <div>
                    <label className="label">Client GSTIN</label>
                    <input
                      type="text"
                      value={formData.client_gstin}
                      onChange={(e) => setFormData({ ...formData, client_gstin: e.target.value })}
                      className="input"
                      placeholder="22AAAAA0000A1Z5"
                      data-testid="invoice-client-gstin"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Client Email</label>
                    <input
                      type="email"
                      value={formData.client_email}
                      onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                      className="input"
                      placeholder="accounts@acme.com"
                      data-testid="invoice-client-email"
                    />
                  </div>
                  <div>
                    <label className="label">Client Phone</label>
                    <input
                      type="tel"
                      value={formData.client_phone}
                      onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                      className="input"
                      placeholder="+91 98765 43210"
                      data-testid="invoice-client-phone"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Client Address</label>
                  <textarea
                    value={formData.client_address}
                    onChange={(e) => setFormData({ ...formData, client_address: e.target.value })}
                    className="input min-h-[60px]"
                    placeholder="123 Business Park, Mumbai"
                    data-testid="invoice-client-address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Tax Type</label>
                    <select
                      value={formData.tax_type}
                      onChange={(e) => setFormData({ ...formData, tax_type: e.target.value })}
                      className="input"
                      data-testid="invoice-tax-type"
                    >
                      <option value="intra">Intra-State (CGST + SGST)</option>
                      <option value="inter">Inter-State (IGST)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Due Date</label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="input"
                      data-testid="invoice-due-date"
                    />
                  </div>
                </div>

                {/* Items */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="label mb-0">Items</label>
                    <button type="button" onClick={addItem} className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">
                      + Add Item
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          className="input flex-1"
                          placeholder="Item name"
                          data-testid={`invoice-item-name-${index}`}
                        />
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="input w-20"
                          placeholder="Qty"
                          min="1"
                          data-testid={`invoice-item-qty-${index}`}
                        />
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItem(index, 'price', e.target.value)}
                          className="input w-28"
                          placeholder="Price"
                          min="0"
                          step="0.01"
                          data-testid={`invoice-item-price-${index}`}
                        />
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash weight="regular" className="w-5 h-5 text-red-600 dark:text-red-400" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                    <span className="text-slate-900 dark:text-white">₹{calculateSubtotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {formData.tax_type === 'intra' ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">CGST (9%)</span>
                        <span className="text-slate-900 dark:text-white">₹{calculateTax().cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">SGST (9%)</span>
                        <span className="text-slate-900 dark:text-white">₹{calculateTax().sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">IGST (18%)</span>
                      <span className="text-slate-900 dark:text-white">₹{calculateTax().igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-semibold pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-900 dark:text-white">Total</span>
                    <span className="text-primary-600 dark:text-primary-400">₹{calculateTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div>
                  <label className="label">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input min-h-[60px]"
                    placeholder="Payment terms, bank details, etc."
                    data-testid="invoice-notes"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" data-testid="save-invoice-btn">
                    Create Invoice
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Invoice Modal */}
      <AnimatePresence>
        {viewInvoice && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setViewInvoice(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-lifted max-w-2xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-white">
                    {viewInvoice.invoice_number}
                  </h3>
                  <span className={`badge ${statusBadges[viewInvoice.status] || 'badge-pending'} mt-1`}>
                    {viewInvoice.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadPdf(viewInvoice.invoice_id)}
                    className="btn-secondary py-2"
                  >
                    <DownloadSimple weight="bold" className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                  <button onClick={() => setViewInvoice(null)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                    <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
              </div>
              <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Client Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Bill To</p>
                    <p className="font-medium text-slate-900 dark:text-white">{viewInvoice.client_name}</p>
                    {viewInvoice.client_address && <p className="text-sm text-slate-600 dark:text-slate-400">{viewInvoice.client_address}</p>}
                    {viewInvoice.client_gstin && <p className="text-sm text-slate-600 dark:text-slate-400">GSTIN: {viewInvoice.client_gstin}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Invoice Date</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {new Date(viewInvoice.created_at).toLocaleDateString('en-IN')}
                    </p>
                    {viewInvoice.due_date && (
                      <>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 mt-3">Due Date</p>
                        <p className="font-medium text-slate-900 dark:text-white">{viewInvoice.due_date}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800">
                        <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">Item</th>
                        <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">Qty</th>
                        <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">Price</th>
                        <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {viewInvoice.items?.map((item, i) => (
                        <tr key={i}>
                          <td className="px-4 py-3 text-slate-900 dark:text-white">{item.name}</td>
                          <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">₹{item.price?.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3 text-right text-slate-900 dark:text-white">₹{(item.quantity * item.price).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                    <span className="text-slate-900 dark:text-white">₹{viewInvoice.subtotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {viewInvoice.cgst > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">CGST (9%)</span>
                        <span className="text-slate-900 dark:text-white">₹{viewInvoice.cgst?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">SGST (9%)</span>
                        <span className="text-slate-900 dark:text-white">₹{viewInvoice.sgst?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </>
                  )}
                  {viewInvoice.igst > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">IGST (18%)</span>
                      <span className="text-slate-900 dark:text-white">₹{viewInvoice.igst?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-semibold pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-900 dark:text-white">Total</span>
                    <span className="text-primary-600 dark:text-primary-400">₹{viewInvoice.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Mark as:</span>
                  <button
                    onClick={() => handleStatusChange(viewInvoice.invoice_id, 'paid')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewInvoice.status === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                  >
                    <Check weight="bold" className="w-4 h-4 inline mr-1" />
                    Paid
                  </button>
                  <button
                    onClick={() => handleStatusChange(viewInvoice.invoice_id, 'pending')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewInvoice.status === 'pending' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'}`}
                  >
                    <Clock weight="bold" className="w-4 h-4 inline mr-1" />
                    Pending
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
