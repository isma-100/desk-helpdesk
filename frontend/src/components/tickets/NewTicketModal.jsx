import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { ticketAPI } from 'api';
import { Modal, FormField, Select, Spinner, FileIcon } from 'components/common';
import { formatBytes, CATEGORIES, PRIORITIES } from 'utils/helpers';
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

export const NewTicketModal = ({ open, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    title: '', description: '', category: 'Hardware', priority: 'Medium', location: ''
  });
  const [files, setFiles]   = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (val) => {
    setForm(p => ({ ...p, [field]: val }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length) {
      const reasons = rejected.map(r => r.errors.map(e => e.message).join(', ')).join('; ');
      toast.error(`Rejected: ${reasons}`);
    }
    const toAdd = accepted.filter(f => !files.find(x => x.name === f.name));
    const remaining = MAX_FILES - files.length;
    if (toAdd.length > remaining) toast.error(`Max ${MAX_FILES} files allowed`);
    setFiles(prev => [...prev, ...toAdd.slice(0, remaining)]);
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    }
  });

  const removeFile = (name) => setFiles(p => p.filter(f => f.name !== name));

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title = 'Title is required';
    else if (form.title.length < 5) e.title = 'Title must be at least 5 characters';
    if (!form.description.trim()) e.description = 'Please describe the problem';
    else if (form.description.length < 10) e.description = 'Description must be at least 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => v && formData.append(k, v));
      files.forEach(f => formData.append('attachments', f));
      const res = await ticketAPI.create(formData);
      toast.success(`Ticket ${res.data.data.ticketId} submitted!`);
      onSuccess?.(res.data.data);
      handleClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit ticket');
    } finally { setLoading(false); }
  };

  const handleClose = () => {
    setForm({ title: '', description: '', category: 'Hardware', priority: 'Medium', location: '' });
    setFiles([]);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Submit New Ticket"
      subtitle="Describe your IT issue clearly and we'll get right on it"
      size="lg"
      footer={<>
        <button className="btn btn-secondary" onClick={handleClose} disabled={loading}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <><Spinner size="sm" />Submitting…</> : 'Submit Ticket'}
        </button>
      </>}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField label="Issue Title" required error={errors.title}>
          <input
            type="text"
            value={form.title}
            onChange={e => set('title')(e.target.value)}
            className={`input ${errors.title ? 'input-error' : ''}`}
            placeholder="e.g. Cannot connect to company VPN"
            maxLength={200}
          />
          <div className="text-right text-[10px] text-slate-400 mt-0.5">{form.title.length}/200</div>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Category" required>
            <Select value={form.category} onChange={set('category')} options={CATEGORIES} />
          </FormField>
          <FormField label="Priority" required>
            <Select value={form.priority} onChange={set('priority')} options={PRIORITIES} />
          </FormField>
        </div>

        <FormField label="Describe the Problem" required error={errors.description}>
          <textarea
            value={form.description}
            onChange={e => set('description')(e.target.value)}
            className={`input min-h-[110px] resize-y ${errors.description ? 'input-error' : ''}`}
            placeholder="What happened? When did it start? What have you already tried?"
            maxLength={5000}
          />
          <div className="text-right text-[10px] text-slate-400 mt-0.5">{form.description.length}/5000</div>
        </FormField>

        <FormField label="Your Location / Desk Number" hint="e.g. Floor 2, Desk 14 — helps us find you faster">
          <input type="text" value={form.location} onChange={e => set('location')(e.target.value)}
            className="input" placeholder="Floor 2, Desk 14" />
        </FormField>

        {/* File Upload */}
        <FormField label={`Attachments (${files.length}/${MAX_FILES} — max 10MB each)`}>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all
              ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
          >
            <input {...getInputProps()} />
            <CloudArrowUpIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">
              {isDragActive ? 'Drop files here…' : 'Drag & drop or click to upload'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Images, PDF, Word, TXT — max 10MB each</p>
          </div>

          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map(file => (
                <div key={file.name} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <FileIcon mimetype={file.type} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-700 truncate">{file.name}</div>
                    <div className="text-[10px] text-slate-400">{formatBytes(file.size)}</div>
                  </div>
                  <button type="button" onClick={() => removeFile(file.name)}
                    className="btn-icon w-6 h-6 text-slate-400 hover:text-red-500">
                    <XMarkIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </FormField>

        {form.priority === 'Urgent' && (
          <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-base flex-shrink-0">⚠️</span>
            <p className="text-xs text-red-700">
              <strong>Urgent priority</strong> — please only use this for business-critical issues.
              IT staff will be alerted immediately.
            </p>
          </div>
        )}
      </form>
    </Modal>
  );
};
