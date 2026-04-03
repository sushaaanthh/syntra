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
  const [selectedFile, setSelectedFile] = useState(null);
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
      <div className="mb-8">
        <h1 className="font-heading text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Excel Sync
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Upload your Excel or CSV files. We'll detect changes and trigger automations.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        className={`drop-zone p-10 text-center mb-8 ${dragActive ? 'active' : ''}`}
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
            <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
              <CloudArrowUp weight="duotone" className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
              {uploading ? 'Uploading...' : 'Drop your file here'}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              or click to browse
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Supports .xlsx, .xls, .csv
            </p>
          </div>
        </label>
        {uploading && (
          <div className="mt-4">
            <div className="w-48 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3"
        >
          <Warning weight="bold" className="w-5 h-5 text-red-600 dark:text-red-400" />
          <span className="text-red-700 dark:text-red-400">{error}</span>
          <button onClick={() => setError('')} className="ml-auto">
            <X className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3"
        >
          <Check weight="bold" className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-green-700 dark:text-green-400">{success}</span>
          <button onClick={() => setSuccess('')} className="ml-auto">
            <X className="w-4 h-4 text-green-600 dark:text-green-400" />
          </button>
        </motion.div>
      )}

      {/* Files List */}
      <div className="card">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-heading font-semibold text-slate-900 dark:text-white">
            Uploaded Files
          </h2>
        </div>
        
        {files.length === 0 ? (
          <div className="p-10 text-center">
            <FileXls weight="duotone" className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No files uploaded yet</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">Upload an Excel file to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {files.map((file) => (
              <div
                key={file.file_id}
                className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                data-testid={`excel-file-${file.file_id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Table weight="duotone" className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{file.filename}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {file.row_count} rows · {file.columns?.length || 0} columns
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleView(file.file_id)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    data-testid={`view-file-${file.file_id}`}
                  >
                    <Eye weight="regular" className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(file.file_id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    data-testid={`delete-file-${file.file_id}`}
                  >
                    <Trash weight="regular" className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data Preview Modal */}
      {viewData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewData(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-lifted max-w-4xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-heading font-semibold text-slate-900 dark:text-white">
                {viewData.filename}
              </h3>
              <button
                onClick={() => setViewData(null)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(80vh-60px)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800">
                    {viewData.columns?.map((col, i) => (
                      <th key={i} className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {viewData.rows?.slice(0, 50).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
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
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
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
