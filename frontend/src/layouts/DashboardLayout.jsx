import React from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export function DashboardLayout() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isOrganizer = role === 'organizer';
  const isAdmin = role === 'admin';

  return (
    <div className="dash-root">
      {/* Top Header */}
      <header className="dash-header">
        <div className="dash-header-inner">
          <div className="dash-brand">
            <Link to="/" className="brand-link">
              <span className="wordmark-primary">BOX OFFICE</span>
            </Link>
            <span className="desk-indicator font-mono">
              {isAdmin ? 'ADMINISTRATION PORTAL' : 'ORGANIZER WORKBENCH'}
            </span>
          </div>

          <div className="dash-user-actions">
            <Link to="/" className="public-portal-link">
              ← Public Catalogue
            </Link>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="role-pill font-mono">{role}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Role Navigation Strip */}
        <nav className="dash-nav-strip" aria-label="Workbench Navigation">
          <div className="nav-strip-inner">
            {isOrganizer && (
              <>
                <NavLink
                  to="/organizer/dashboard"
                  end
                  className={({ isActive }) => `dash-link ${isActive ? 'dash-link-active' : ''}`}
                >
                  Dashboard Overview
                </NavLink>
                <NavLink
                  to="/organizer/events"
                  className={({ isActive }) => `dash-link ${isActive ? 'dash-link-active' : ''}`}
                >
                  My Events
                </NavLink>
                <NavLink
                  to="/organizer/venues"
                  className={({ isActive }) => `dash-link ${isActive ? 'dash-link-active' : ''}`}
                >
                  Venues
                </NavLink>
                <NavLink
                  to="/organizer/ticket-types"
                  className={({ isActive }) => `dash-link ${isActive ? 'dash-link-active' : ''}`}
                >
                  Ticket Types
                </NavLink>
                <NavLink
                  to="/organizer/registrations"
                  className={({ isActive }) => `dash-link ${isActive ? 'dash-link-active' : ''}`}
                >
                  Registrations & Check-In
                </NavLink>
                <NavLink
                  to="/organizer/payments"
                  className={({ isActive }) => `dash-link ${isActive ? 'dash-link-active' : ''}`}
                >
                  Payments Audit
                </NavLink>
                <NavLink
                  to="/organizer/reports"
                  className={({ isActive }) => `dash-link ${isActive ? 'dash-link-active' : ''}`}
                >
                  Reports & Analytics
                </NavLink>
              </>
            )}

            {isAdmin && (
              <>
                <NavLink
                  to="/admin/dashboard"
                  end
                  className={({ isActive }) => `dash-link ${isActive ? 'dash-link-active' : ''}`}
                >
                  Platform Overview
                </NavLink>
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) => `dash-link ${isActive ? 'dash-link-active' : ''}`}
                >
                  Users Management
                </NavLink>
                <NavLink
                  to="/admin/events"
                  className={({ isActive }) => `dash-link ${isActive ? 'dash-link-active' : ''}`}
                >
                  All Events
                </NavLink>
                <NavLink
                  to="/admin/venues"
                  className={({ isActive }) => `dash-link ${isActive ? 'dash-link-active' : ''}`}
                >
                  All Venues
                </NavLink>
                <NavLink
                  to="/admin/registrations"
                  className={({ isActive }) => `dash-link ${isActive ? 'dash-link-active' : ''}`}
                >
                  All Registrations
                </NavLink>
                <NavLink
                  to="/admin/payments"
                  className={({ isActive }) => `dash-link ${isActive ? 'dash-link-active' : ''}`}
                >
                  Payments Ledger
                </NavLink>
                <NavLink
                  to="/admin/reports"
                  className={({ isActive }) => `dash-link ${isActive ? 'dash-link-active' : ''}`}
                >
                  Global Reports
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="dash-main">
        <div className="dash-container">
          <Outlet />
        </div>
      </main>

      <style>{`
        .dash-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--color-paper);
        }
        .dash-header {
          background-color: var(--color-surface);
          border-bottom: var(--border-hairline);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .dash-header-inner {
          max-width: var(--container-max);
          margin: 0 auto;
          padding: var(--space-3) var(--space-6);
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--color-rule);
        }
        .dash-brand {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }
        .brand-link {
          text-decoration: none;
          color: var(--color-ink);
        }
        .desk-indicator {
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          padding: 2px 8px;
          border-left: 2px solid var(--color-accent);
          color: var(--color-muted);
        }
        .dash-user-actions {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }
        .public-portal-link {
          font-size: 0.8125rem;
          color: var(--color-muted);
          text-decoration: none;
        }
        .public-portal-link:hover {
          color: var(--color-ink);
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .user-name {
          font-size: 0.875rem;
          font-weight: 500;
        }
        .role-pill {
          font-size: 0.6875rem;
          text-transform: uppercase;
          background-color: var(--color-paper);
          border: 1px solid var(--color-rule);
          padding: 1px 6px;
        }
        .dash-nav-strip {
          max-width: var(--container-max);
          margin: 0 auto;
          padding: 0 var(--space-6);
          overflow-x: auto;
          white-space: nowrap;
        }
        .nav-strip-inner {
          display: flex;
          gap: var(--space-6);
        }
        .dash-link {
          font-family: var(--font-ui);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-muted);
          text-decoration: none;
          padding: var(--space-3) 0;
          position: relative;
          display: inline-block;
          transition: color var(--transition-fast);
        }
        .dash-link:hover {
          color: var(--color-ink);
        }
        .dash-link-active {
          color: var(--color-ink);
          font-weight: 600;
        }
        .dash-link-active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background-color: var(--color-accent);
        }
        .dash-main {
          flex: 1;
          padding: var(--space-8) var(--space-6);
        }
        .dash-container {
          max-width: var(--container-max);
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}

