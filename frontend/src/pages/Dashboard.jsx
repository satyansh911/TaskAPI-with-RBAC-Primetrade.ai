import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../api/api';
import { Navbar } from '../components/Navbar';
import { TaskModal } from '../components/TaskModal';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Clock, CheckCircle2, Loader2, Filter, RefreshCw } from 'lucide-react';

const STATUS_BADGE = {
  pending:     { cls: 'badge-yellow',  label: 'Pending',     icon: '⏳' },
  in_progress: { cls: 'badge-cyan',    label: 'In Progress', icon: '🔄' },
  done:        { cls: 'badge-green',   label: 'Done',        icon: '✅' },
};
const PRIORITY_BADGE = {
  low:    { cls: 'badge-gray',   label: 'Low' },
  medium: { cls: 'badge-yellow', label: 'Medium' },
  high:   { cls: 'badge-red',    label: 'High' },
};

const isOverdue = (due_date, status) => {
  if (!due_date || status === 'done') return false;
  // Parse date parts in local timezone to avoid UTC-shift false positives
  const datePart = typeof due_date === 'string' ? due_date.slice(0, 10) : new Date(due_date).toISOString().slice(0, 10);
  const [year, month, day] = datePart.split('-').map(Number);
  const localDue = new Date(year, month - 1, day);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return localDue < today;
};

// Parse date string parts directly in LOCAL timezone to prevent UTC-midnight → local
// date shift (e.g. '2026-05-18' becoming May 17 in UTC+ timezones)
const formatDate = (d) => {
  if (!d) return null;
  const datePart = typeof d === 'string' ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

export const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 9, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', sort: 'created_at', order: 'desc', page: 1, limit: 9 });
  const [modal, setModal] = useState({ open: false, task: null });
  const [deleting, setDeleting] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const res = await tasksAPI.getAll(params);
      setTasks(res.data.data.tasks);
      setMeta(res.data.meta);
    } catch {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    setDeleting(id);
    try {
      await tasksAPI.delete(id);
      toast.success('Task deleted');
      fetchTasks();
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setDeleting(null);
    }
  };

  const setFilter = (key, value) => setFilters((p) => ({ ...p, [key]: value, page: 1 }));
  const setPage = (p) => setFilters((prev) => ({ ...prev, page: p }));

  // Stats
  const total = meta.total;
  const done = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const high = tasks.filter((t) => t.priority === 'high').length;

  return (
    <div className="dashboard-layout">
      <Navbar />
      <main className="dashboard-main">
        {/* Welcome */}
        <div style={{ marginBottom: '1.5rem' }} className="animate-fadeInUp">
          <h2>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span style={{ color: 'var(--color-primary-light)' }}>{user?.name?.split(' ')[0]}</span> 👋
          </h2>
          <p className="text-muted text-sm">Here&apos;s an overview of your tasks</p>
        </div>

        {/* Stats */}
        <div className="stats-grid animate-fadeInUp animate-delay-1">
          <div className="stat-card stat-purple">
            <span className="stat-value">{total}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
          <div className="stat-card stat-cyan">
            <span className="stat-value">{inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-card stat-green">
            <span className="stat-value">{done}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-card stat-yellow">
            <span className="stat-value">{high}</span>
            <span className="stat-label">High Priority</span>
          </div>
        </div>

        {/* Tasks Header */}
        <div className="tasks-header animate-fadeInUp animate-delay-2">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={20} style={{ color: 'var(--color-primary-light)' }} />
            My Tasks
            <span className="badge badge-purple">{total}</span>
          </h3>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Filters */}
            <div className="tasks-filters">
              <select
                id="filter-status"
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.82rem' }}
                value={filters.status}
                onChange={(e) => setFilter('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>

              <select
                id="filter-priority"
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.82rem' }}
                value={filters.priority}
                onChange={(e) => setFilter('priority', e.target.value)}
              >
                <option value="">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <button id="btn-refresh" className="btn btn-ghost btn-sm" onClick={fetchTasks} title="Refresh">
                <RefreshCw size={14} />
              </button>
            </div>

            <button
              id="btn-new-task"
              className="btn btn-primary btn-sm"
              onClick={() => setModal({ open: true, task: null })}
            >
              <Plus size={16} /> New Task
            </button>
          </div>
        </div>

        {/* Task Grid */}
        {loading ? (
          <div className="loading-center">
            <div className="spinner spinner-lg" />
            <span>Loading tasks...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state glass-card">
            <div className="empty-state-icon">📋</div>
            <h3>No tasks yet</h3>
            <p>Create your first task to get started</p>
            <button id="btn-create-first" className="btn btn-primary" onClick={() => setModal({ open: true, task: null })}>
              <Plus size={16} /> Create Task
            </button>
          </div>
        ) : (
          <div className="tasks-grid animate-fadeInUp animate-delay-3">
            {tasks.map((task) => {
              const sb = STATUS_BADGE[task.status] || STATUS_BADGE.pending;
              const pb = PRIORITY_BADGE[task.priority] || PRIORITY_BADGE.medium;
              const overdue = isOverdue(task.due_date, task.status);

              return (
                <div key={task.id} className="task-card">
                  <div className="task-card-header">
                    <span className="task-card-title">{task.title}</span>
                    <div className="task-card-actions">
                      <button
                        id={`btn-edit-${task.id}`}
                        className="btn btn-ghost"
                        style={{ padding: '0.3rem' }}
                        onClick={() => setModal({ open: true, task })}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        id={`btn-delete-${task.id}`}
                        className="btn btn-ghost"
                        style={{ padding: '0.3rem', color: 'var(--color-danger)' }}
                        onClick={() => handleDelete(task.id)}
                        disabled={deleting === task.id}
                        title="Delete"
                      >
                        {deleting === task.id ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>

                  {task.description && (
                    <p className="task-card-description">{task.description}</p>
                  )}

                  <div className="task-card-footer">
                    <div className="task-card-meta">
                      <span className={`badge ${sb.cls}`}>{sb.icon} {sb.label}</span>
                      <span className={`badge ${pb.cls}`}>{pb.label}</span>
                    </div>
                    {task.due_date && (
                      <span className={`task-due ${overdue ? 'overdue' : ''}`}>
                        <Clock size={11} />
                        {overdue ? '⚠️ ' : ''}{formatDate(task.due_date)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`page-btn ${meta.page === p ? 'active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </main>

      {modal.open && (
        <TaskModal
          task={modal.task}
          onClose={() => setModal({ open: false, task: null })}
          onSaved={fetchTasks}
        />
      )}
    </div>
  );
};
