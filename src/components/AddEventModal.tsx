import { useState, useEffect, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { DataGridRow, TimelineEvent } from '../types';

interface AddEditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { gridRow: DataGridRow; timelineEvent: TimelineEvent }) => void;
  initialData?: { gridRow: DataGridRow; timelineEvent?: TimelineEvent } | null;
}

export function AddEventModal({ isOpen, onClose, onSave, initialData }: AddEditEventModalProps) {
  const isEdit = Boolean(initialData);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Work' | 'Personal' | 'Urgent' | 'Health' | 'Finance'>('Work');
  const [status, setStatus] = useState<'Pending' | 'In Progress' | 'Completed' | 'Cancelled'>('Pending');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');
  const [amount, setAmount] = useState('100');
  const [description, setDescription] = useState('');

  const [errors, setErrors] = useState<{
    title?: string;
    date?: string;
    time?: string;
    amount?: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState('');

  const titleInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.gridRow.title);
      setCategory(initialData.gridRow.category);
      setStatus(initialData.gridRow.status);
      setDate(initialData.gridRow.date);
      setAmount(initialData.gridRow.amount.toString());
      setTime(initialData.timelineEvent?.time || '12:00');
      setDescription(initialData.timelineEvent?.description || '');
    } else {
      setTitle('');
      setCategory('Work');
      setStatus('Pending');
      setDate(new Date().toISOString().substring(0, 10));
      setTime('12:00');
      setAmount('100');
      setDescription('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => titleInputRef.current?.focus(), 50);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: {
      title?: string;
      date?: string;
      time?: string;
      amount?: string;
    } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required.';
    }

    const parsedDate = Date.parse(date);
    const year = new Date(date).getFullYear();

    if (!date) {
    newErrors.date = 'Valid date is required.';
    } else if (isNaN(parsedDate) || year < 1900 || year > 2100) {
    newErrors.date = 'Please enter a valid date (e.g. 1900-2100).';
    }

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!time.trim()) {
      newErrors.time = 'Time is required.';
    } else if (!timeRegex.test(time)) {
      newErrors.time = 'Please enter a valid time (HH:mm).';
    }

    const parsedAmount = Number(amount);
    if (amount.trim() === '' || isNaN(parsedAmount) || parsedAmount < 0) {
      newErrors.amount = 'Please enter a valid non-negative amount.';
    }

    setErrors(newErrors);

    if (newErrors.title) {
      titleInputRef.current?.focus();
      return false;
    } else if (newErrors.date) {
      dateInputRef.current?.focus();
      return false;
    } else if (newErrors.time) {
      timeInputRef.current?.focus();
      return false;
    } else if (newErrors.amount) {
      amountInputRef.current?.focus();
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const eventId = initialData?.gridRow.id || `EVT-${Date.now().toString().slice(-5)}`;

    const gridRow: DataGridRow = {
      id: eventId,
      title: title.trim(),
      category,
      status,
      date,
      amount: Number(amount) || 0,
    };

    const timelineEvent: TimelineEvent = {
      id: eventId,
      title: title.trim(),
      date,
      time,
      description: description || 'No description provided',
      category,
    };

    onSave({ gridRow, timelineEvent });

    setSuccessMessage(`Event successfully ${isEdit ? 'updated' : 'added'}!`);

    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="sr-only" role="status" aria-live="polite">
        {successMessage}
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white relative z-10">
        <h2
            id="modal-title"
            style={{ color: '#000000', opacity: 1 }}
            className="text-xl font-bold tracking-tight text-slate-950"
        >
            {isEdit ? 'Edit Event' : 'Add New Event'}
        </h2>
        <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-700 hover:text-black hover:bg-slate-200 transition-colors"
        >
            <X className="w-5 h-5 stroke-[2.5]" />
        </button>
        </div>
        {successMessage && (
        <div 
            className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium flex items-center gap-2"
            role="status" 
            aria-live="polite"
        >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {successMessage}
        </div>
        )}
        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="e.g. System Security Audit"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'title-error' : undefined}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-hidden focus:ring-2 ${
                errors.title
                  ? 'border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
            />
            {errors.title && (
              <p id="title-error" className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.title}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Urgent">Urgent</option>
                <option value="Health">Health</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Status (Grid)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                ref={dateInputRef}
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
                }}
                aria-invalid={Boolean(errors.date)}
                aria-describedby={errors.date ? 'date-error' : undefined}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-hidden focus:ring-2 ${
                  errors.date
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:ring-blue-500'
                }`}
              />
              {errors.date && (
                <p id="date-error" className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.date}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Time <span className="text-rose-500">*</span>
              </label>
              <input
                ref={timeInputRef}
                type="time"
                value={time}
                onChange={(e) => {
                  setTime(e.target.value);
                  if (errors.time) setErrors((prev) => ({ ...prev, time: undefined }));
                }}
                aria-invalid={Boolean(errors.time)}
                aria-describedby={errors.time ? 'time-error' : undefined}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-hidden focus:ring-2 ${
                  errors.time
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:ring-blue-500'
                }`}
              />
              {errors.time && (
                <p id="time-error" className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.time}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Amount ($) <span className="text-rose-500">*</span>
              </label>
              <input
                ref={amountInputRef}
                type="number"
                min="0"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                }}
                aria-invalid={Boolean(errors.amount)}
                aria-describedby={errors.amount ? 'amount-error' : undefined}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-hidden focus:ring-2 ${
                  errors.amount
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:ring-blue-500'
                }`}
              />
              {errors.amount && (
                <p id="amount-error" className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.amount}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Description (Timeline)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs"
            >
              {isEdit ? 'Update Event' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}