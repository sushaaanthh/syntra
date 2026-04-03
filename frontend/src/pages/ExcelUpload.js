import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  CloudArrowUp,
  Table,
  Trash,
  Eye,
  X,
  FileXls,
  Check,
  Warning
} from '@phosphor-icons/react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function ExcelUpload() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchFiles = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/excel/files`, { withCredentials: true });
      setFiles(res.data);
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file) => {
    setError('');
    setSuccess('');
    
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('Please upload an Excel (.xlsx, .xls) or CSV file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API_URL}/api/excel/upload`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(`Uploaded ${res.data.filename} with ${res.data.row_count} rows`);
      fetchFiles();
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    try {
      await axios.delete(`${API_URL}/api/excel/${fileId}`, { withCredentials: true });
      setFiles(files.filter(f => f.file_id !== fileId));
      if (viewData?.file_id === fileId) setViewData(null);
    } catch (err) {
      setError('Failed to delete file');
    }
  };

  const handleView = async (fileId) => {
    try {
      const res = await axios.get(`${API_URL}/api/excel/${fileId}`, { withCredentials: true });
      setViewData({ ...res.data, file_id: fileId });
    } catch (err) {
      setError('Failed to load file data');
    }
  };

  return (
    <div className="p-6 lg:p-10" data-testid="excel-upload-page">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          Excel Sync
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Upload your Excel or CSV files. We'll detect changes and trigger automations.
        </p>
      </motion.div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`drop-zone p-12 text-center mb-8 ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          data-testid="excel-file-input"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 shadow-lg">
              <CloudArrowUp weight="fill" className="w-10 h-10 text-white" />
            </div>
            <p className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">
              {uploading ? 'Uploading...' : 'Drop your file here'}
            </p>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              or click to browse
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Supports .xlsx, .xls, .csv
            </p>
          </div>
        </label>
        {uploading && (
          <div className="mt-6">
            <div className="w-64 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 flex items-center gap-3"
        >
          <Warning weight="bold" className="w-5 h-5 text-red-500" />
          <span className="text-red-700 dark:text-red-400 font-medium">{error}</span>
          <button onClick={() => setError('')} className="ml-auto">
            <X className="w-4 h-4 text-red-500" />
          </button>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/50 flex items-center gap-3"
        >
          <Check weight="bold" className="w-5 h-5 text-emerald-500" />
          <span className="text-emerald-700 dark:text-emerald-400 font-medium">{success}</span>
          <button onClick={() => setSuccess('')} className="ml-auto">
            <X className="w-4 h-4 text-emerald-500" />
          </button>
        </motion.div>
      )}

      {/* Files List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="p-5 border-b border-slate-200/50 dark:border-slate-700/50">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Uploaded Files
          </h2>
        </div>
        
        {files.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
              <FileXls weight="duotone" className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-lg font-medium text-slate-500 dark:text-slate-400">No files uploaded yet</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">Upload an Excel file to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
            {files.map((file) => (
              <div
                key={file.file_id}
                className="p-5 flex items-center justify-between hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
                data-testid={`excel-file-${file.file_id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                    <Table weight="fill" className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{file.filename}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {file.row_count} rows · {file.columns?.length || 0} columns
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleView(file.file_id)}
                    className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    data-testid={`view-file-${file.file_id}`}
                  >
                    <Eye weight="duotone" className="w-5 h-5 text-slate-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(file.file_id)}
                    className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    data-testid={`delete-file-${file.file_id}`}
                  >
                    <Trash weight="duotone" className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Data Preview Modal */}
      {viewData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewData(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card-solid max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {viewData.filename}
              </h3>
              <button
                onClick={() => setViewData(null)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-5 overflow-auto max-h-[calc(85vh-70px)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800">
                    {viewData.columns?.map((col, i) => (
                      <th key={i} className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                  {viewData.rows?.slice(0, 50).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      {viewData.columns?.map((col, j) => (
                        <td key={j} className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {row[col] != null ? String(row[col]) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {viewData.rows?.length > 50 && (
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6 font-medium">
                  Showing first 50 of {viewData.rows.length} rows
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
