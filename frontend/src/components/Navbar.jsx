import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LogOut, Shield, LayoutDashboard } from 'lucide-react';
import logoGif from '../assets/logo.gif';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAdminPopup, setShowAdminPopup] = useState(false);

  useEffect(() => {
    if (isAdmin && location.pathname !== '/admin') {
      const hasSeen = sessionStorage.getItem('hasSeenAdminHint');
      if (!hasSeen) {
        setShowAdminPopup(true);
      }
    } else {
      setShowAdminPopup(false);
    }
  }, [isAdmin, location.pathname]);

  const dismissPopup = (e) => {
    e.preventDefault();
    e.stopPropagation();
    sessionStorage.setItem('hasSeenAdminHint', 'true');
    setShowAdminPopup(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <div className="navbar-brand-icon" style={{ overflow: 'hidden', padding: '2px', background: 'rgba(15, 15, 30, 0.6)', border: '1px solid var(--color-border)' }}>
            <img src={logoGif} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'inherit' }} />
          </div>
          <span>TaskAPI</span>
        </Link>

        <div className="navbar-right">
          <Link to="/dashboard" className="btn btn-ghost btn-sm" title="Dashboard">
            <LayoutDashboard size={16} />
            <span style={{ display: 'none' }}>Dashboard</span>
          </Link>

          {isAdmin && (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Link
                to="/admin"
                className="btn btn-ghost btn-sm"
                title="Admin Panel"
                onClick={() => {
                  sessionStorage.setItem('hasSeenAdminHint', 'true');
                  setShowAdminPopup(false);
                }}
              >
                <Shield size={16} />
                <span className="text-muted text-sm" style={{ color: 'var(--color-primary-light)' }}>Admin</span>
              </Link>
              {showAdminPopup && (
                <div className="admin-hint-popup">
                  <div className="admin-hint-arrow" />
                  <p>Want to see tasks and users across all accounts? Visit the Admin Panel!</p>
                  <button onClick={dismissPopup} className="btn-close-hint" aria-label="Close Hint">×</button>
                </div>
              )}
            </div>
          )}

          <div className="navbar-user">
            <div className="navbar-avatar">{initials}</div>
            <span>{user?.name?.split(' ')[0]}</span>
            {isAdmin && (
              <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>Admin</span>
            )}
          </div>

          <button
            id="btn-logout"
            className="btn btn-secondary btn-sm"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </nav>
  );
};
