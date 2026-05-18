import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/api';
import toast from 'react-hot-toast';
import { AlertCircle, Eye, EyeOff, KeyRound } from 'lucide-react';
import logoGif from '../assets/logo.gif';

export const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', adminKey: '' });
  const [showPass, setShowPass] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError('');

    try {
      const payload = { name: form.name, email: form.email, password: form.password };
      if (form.adminKey) payload.adminKey = form.adminKey;

      const res = await authAPI.register(payload);
      const { user, token } = res.data.data;

      login(user, token);
      toast.success(`Welcome, ${user.name}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        const fieldErrors = {};
        data.errors.forEach(({ field, message }) => { fieldErrors[field] = message; });
        setErrors(fieldErrors);
      } else {
        setApiError(data?.message || 'Registration failed. Please try again.');
      }
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
          <h1 className="auth-title" style={{ fontSize: '1.5rem' }}>Create Account</h1>
          <p className="auth-subtitle">Join and start managing your tasks</p>

          {apiError && (
            <div className="alert alert-error mb-2">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {apiError}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                autoComplete="name"
              />
              {errors.name && <span className="form-error"><AlertCircle size={12} />{errors.name}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                autoComplete="email"
              />
              {errors.email && <span className="form-error"><AlertCircle size={12} />{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Min 8 chars, upper + lower + number"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  autoComplete="new-password"
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
              {errors.password && <span className="form-error"><AlertCircle size={12} />{errors.password}</span>}
            </div>

            {/* Admin Key (collapsible) */}
            <div className="form-group">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowAdmin(!showAdmin)}
                style={{ alignSelf: 'flex-start', gap: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}
              >
                <KeyRound size={13} />
                {showAdmin ? 'Hide' : 'Register as Admin?'}
              </button>
              {showAdmin && (
                <input
                  id="reg-admin-key"
                  type="password"
                  className="form-input"
                  placeholder="Enter admin secret key"
                  value={form.adminKey}
                  onChange={(e) => set('adminKey', e.target.value)}
                  autoComplete="off"
                />
              )}
            </div>

            <button id="btn-register" type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
