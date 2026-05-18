import { useState } from 'react';
import { tasksAPI } from '../api/api';
import toast from 'react-hot-toast';
import { X, Calendar, AlertCircle } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const TaskModal = ({ task = null, onClose, onSaved }) => {
  const isEdit = Boolean(task);

  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'pending',
    priority: task?.priority || 'medium',
    // due_date from the API is now always a plain 'YYYY-MM-DD' string (pg type parser fix).
    // slice(0, 10) handles both 'YYYY-MM-DD' and any legacy ISO timestamp gracefully.
    due_date: task?.due_date ? String(task.due_date).slice(0, 10) : '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (form.title.length > 200) e.title = 'Title must be under 200 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: form.status,
        priority: form.priority,
        due_date: form.due_date || null,
      };

      if (isEdit) {
        await tasksAPI.update(task.id, payload);
        toast.success('Task updated!');
      } else {
        await tasksAPI.create(payload);
        toast.success('Task created!');
      }

      onSaved();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      const apiErrors = err.response?.data?.errors;
      if (apiErrors?.length) {
        const fieldErrors = {};
        apiErrors.forEach(({ field, message }) => { fieldErrors[field] = message; });
        setErrors(fieldErrors);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h3 id="modal-title">{isEdit ? '✏️ Edit Task' : '➕ New Task'}</h3>
          <button id="btn-close-modal" className="btn btn-ghost" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-title">Title *</label>
              <input
                id="task-title"
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="What needs to be done?"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                autoFocus
                maxLength={200}
              />
              {errors.title && (
                <span className="form-error"><AlertCircle size={12} />{errors.title}</span>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-desc">Description</label>
              <textarea
                id="task-desc"
                className="form-textarea"
                placeholder="Add more details..."
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
              />
            </div>

            {/* Status + Priority */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="task-status">Status</label>
                <select
                  id="task-status"
                  className="form-select"
                  value={form.status}
                  onChange={(e) => set('status', e.target.value)}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-priority">Priority</label>
                <select
                  id="task-priority"
                  className="form-select"
                  value={form.priority}
                  onChange={(e) => set('priority', e.target.value)}
                >
                  {PRIORITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-due">
                <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Due Date
              </label>
              <input
                id="task-due"
                type="date"
                className="form-input"
                value={form.due_date}
                onChange={(e) => set('due_date', e.target.value)}
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button id="btn-cancel-task" type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button id="btn-save-task" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Saving...</> : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
