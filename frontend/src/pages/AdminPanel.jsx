import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../api/api';
import { Navbar } from '../components/Navbar';
import toast from 'react-hot-toast';
import { Trash2, Shield, Users, ListTodo, RefreshCw, Loader2 } from 'lucide-react';

const STATUS_BADGE = {
  pending:     { cls: 'badge-yellow', label: 'Pending' },
  in_progress: { cls: 'badge-cyan',   label: 'In Progress' },
  done:        { cls: 'badge-green',  label: 'Done' },
};
const PRIORITY_BADGE = {
  low:    { cls: 'badge-gray',   label: 'Low' },
  medium: { cls: 'badge-yellow', label: 'Medium' },
  high:   { cls: 'badge-red',    label: 'High' },
};

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasksMeta, setTasksMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [usersMeta, setUsersMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [taskPage, setTaskPage] = useState(1);
  const [userPage, setUserPage] = useState(1);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAllTasks({ page: taskPage, limit: 10 });
      setTasks(res.data.data.tasks);
      setTasksMeta(res.data.meta);
    } catch { toast.error('Failed to fetch tasks'); }
    finally { setLoading(false); }
  }, [taskPage]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAllUsers({ page: userPage, limit: 10 });
      setUsers(res.data.data.users);
      setUsersMeta(res.data.meta);
    } catch { toast.error('Failed to fetch users'); }
    finally { setLoading(false); }
  }, [userPage]);

  // Fetch tasks when tab is active
  useEffect(() => { if (activeTab === 'tasks') fetchTasks(); }, [activeTab, fetchTasks]);
  useEffect(() => { if (activeTab === 'users') fetchUsers(); }, [activeTab, fetchUsers]);

  // Always fetch user count on mount so the stats card is populated immediately
  useEffect(() => { fetchUsers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Permanently delete this task?')) return;
    setDeleting(id);
    try {
      await adminAPI.deleteTask(id);
      toast.success('Task deleted');
      fetchTasks();
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(null); }
  };

  // Parse the date string directly in LOCAL timezone to avoid UTC-midnight → local-date
  // shift (e.g. '2026-05-18' parsed as UTC midnight shows as May 17 in UTC+ zones)
  const formatDate = (d) => {
    if (!d) return '—';
    // DATE columns from pg come as 'YYYY-MM-DD'; timestamps have 'T'
    const datePart = typeof d === 'string' ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: '2-digit',
    });
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <main className="dashboard-main">
        {/* Header */}
        <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="animate-fadeInUp">
          <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} style={{ color: '#fff' }} />
          </div>
          <div>
            <h2 style={{ marginBottom: '0.1rem' }}>Admin Panel</h2>
            <p className="text-muted text-sm">Manage all users and tasks</p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid animate-fadeInUp animate-delay-1">
          <div className="stat-card stat-purple">
            <span className="stat-value">{tasksMeta.total}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
          <div className="stat-card stat-cyan">
            <span className="stat-value">{usersMeta.total}</span>
            <span className="stat-label">Registered Users</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs animate-fadeInUp animate-delay-2">
          <button
            id="tab-tasks"
            className={`admin-tab ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <ListTodo size={15} style={{ display: 'inline', marginRight: 6 }} />
            All Tasks
          </button>
          <button
            id="tab-users"
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={15} style={{ display: 'inline', marginRight: 6 }} />
            All Users
          </button>
          <button
            id="btn-admin-refresh"
            className="btn btn-ghost btn-sm"
            style={{ marginLeft: 'auto' }}
            onClick={() => activeTab === 'tasks' ? fetchTasks() : fetchUsers()}
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner spinner-lg" /><span>Loading...</span></div>
        ) : activeTab === 'tasks' ? (
          <div className="glass-card animate-fadeInUp" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>No tasks found</td></tr>
                  ) : tasks.map((t) => (
                    <tr key={t.id}>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span title={t.title}>{t.title}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem' }}>
                          <div style={{ fontWeight: 600 }}>{t.user_name}</div>
                          <div style={{ color: 'var(--color-text-muted)' }}>{t.user_email}</div>
                        </div>
                      </td>
                      <td><span className={`badge ${STATUS_BADGE[t.status]?.cls || 'badge-gray'}`}>{STATUS_BADGE[t.status]?.label}</span></td>
                      <td><span className={`badge ${PRIORITY_BADGE[t.priority]?.cls || 'badge-gray'}`}>{PRIORITY_BADGE[t.priority]?.label}</span></td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{formatDate(t.due_date)}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{formatDate(t.created_at)}</td>
                      <td>
                        <button
                          id={`btn-admin-delete-${t.id}`}
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteTask(t.id)}
                          disabled={deleting === t.id}
                        >
                          {deleting === t.id ? <Loader2 size={13} /> : <Trash2 size={13} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {tasksMeta.totalPages > 1 && (
              <div className="pagination" style={{ padding: '1rem' }}>
                {Array.from({ length: tasksMeta.totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={`page-btn ${tasksMeta.page === p ? 'active' : ''}`} onClick={() => setTaskPage(p)}>{p}</button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card animate-fadeInUp" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>No users found</td></tr>
                  ) : users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {u.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <span style={{ fontWeight: 500 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-gray'}`}>
                          {u.role === 'admin' ? '👑 Admin' : 'User'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{formatDate(u.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {usersMeta.totalPages > 1 && (
              <div className="pagination" style={{ padding: '1rem' }}>
                {Array.from({ length: usersMeta.totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={`page-btn ${usersMeta.page === p ? 'active' : ''}`} onClick={() => setUserPage(p)}>{p}</button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
