import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/api';
import toast from 'react-hot-toast';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import logoGif from '../assets/logo.gif';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setApiError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setApiError('');

    try {
      const res = await authAPI.login(form);
      const { user, token } = res.data.data;
      login(user, token);
      toast.success(`Welcome back, ${user.name}! 👋`);
      navigate(from, { replace: true });
    } catch (err) {
      setApiError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div className="auth-container animate-fadeInUp">
        <div className="auth-logo">
          <div className="auth-logo-icon" style={{ overflow: 'hidden', padding: '4px', background: 'rgba(15, 15, 30, 0.6)', border: '1px solid var(--color-border)' }}>
            <img src={logoGif} alt="Primetrade Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'inherit' }} />
          </div>
          <p className="text-muted text-sm">Primetrade.ai — TaskAPI</p>
        </div>

        <div className="glass-card auth-card">
          <h1 className="auth-title" style={{ fontSize: '1.5rem' }}>Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account</p>

          {apiError && (
            <div className="alert alert-error mb-2">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {apiError}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', padding: '0.25rem' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button id="btn-login" type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="auth-divider">quick start</div>
          <div style={{ background: 'rgba(124,58,237,0.08)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
            <div>Register with <strong style={{ color: 'var(--color-primary-light)' }}>adminKey</strong>: <code style={{ color: '#fbbf24' }}>primetrade_admin_secret_2026</code></div>
          </div>

          <p className="auth-footer" style={{ marginTop: '1rem' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register">Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
