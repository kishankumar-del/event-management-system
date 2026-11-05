import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export function PublicLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="layout-root">
      {/* Editorial Header with Wordmark */}
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="site-wordmark">
            <span className="wordmark-primary">BOX OFFICE</span>
            <span className="wordmark-badge">EMS • PROJECT 9</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            <NavLink
              to="/"
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
              end
            >
              Browse Events
            </NavLink>

            {isAuthenticated && user?.role === 'attendee' && (
              <>
                <NavLink
                  to="/my-tickets"
                  className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
                >
                  My Tickets
                </NavLink>
                <NavLink
                  to="/my-payments"
                  className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
                >
                  My Payments
                </NavLink>
              </>
            )}

            {isAuthenticated && user?.role === 'organizer' && (
              <NavLink
                to="/organizer/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
              >
                Organizer Desk →
              </NavLink>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
              >
                Admin Desk →
              </NavLink>
            )}
          </nav>

          {/* Authentication Actions */}
          <div className="header-actions">
            {isAuthenticated ? (
              <div className="user-profile-menu">
                <span className="user-name font-mono">{user?.name}</span>
                <span className="user-role-tag">{user?.role}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="mobile-nav-panel">
            <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
              Browse Events
            </NavLink>
            {isAuthenticated && user?.role === 'attendee' && (
              <>
                <NavLink to="/my-tickets" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                  My Tickets
                </NavLink>
                <NavLink to="/my-payments" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                  My Payments
                </NavLink>
              </>
            )}
            {isAuthenticated && user?.role === 'organizer' && (
              <NavLink to="/organizer/dashboard" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                Organizer Desk
              </NavLink>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <NavLink to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                Admin Desk
              </NavLink>
            )}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="site-main">
        <Outlet />
      </main>

      {/* Editorial Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-col">
            <div className="wordmark-primary">BOX OFFICE</div>
            <p className="text-muted footer-caption">
              Production-grade Event Management System engineered with strict role isolation, atomic ticket inventory, and live MongoDB aggregation reporting.
            </p>
          </div>
          <div className="footer-col meta-col">
            <span className="font-mono text-muted">Project 9 • MERN Stack College Project</span>
            <span className="font-mono text-muted">Design Concept: Box Office Editorial</span>
          </div>
        </div>
      </footer>

      <style>{`
        .layout-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--color-paper);
        }
        .site-header {
          border-bottom: 2px solid var(--color-accent);
          background-color: var(--color-header-bg);
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 10px rgba(20, 37, 40, 0.15);
        }
        .header-inner {
          max-width: var(--container-max);
          margin: 0 auto;
          padding: 0 var(--space-6);
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4);
        }
        .site-wordmark {
          display: flex;
          align-items: baseline;
          gap: var(--space-3);
          text-decoration: none;
          color: #FFFFFF;
        }
        .wordmark-primary {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.25rem;
          letter-spacing: -0.02em;
          color: #FFFFFF;
        }
        .wordmark-badge {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 600;
          color: var(--color-header-sub);
          background-color: rgba(0, 0, 0, 0.25);
          border: 1px solid var(--color-header-sub);
          padding: 1px 6px;
          border-radius: var(--radius-sm);
          letter-spacing: 0.08em;
        }
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: var(--space-6);
        }
        .nav-link {
          font-family: var(--font-ui);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-header-text);
          text-decoration: none;
          position: relative;
          padding: var(--space-2) 0;
          transition: color var(--transition-fast);
        }
        .nav-link:hover {
          color: #FFFFFF;
        }
        .nav-link-active {
          color: #FFFFFF;
          font-weight: 600;
        }
        .nav-link-active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background-color: var(--color-accent);
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .auth-buttons {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .user-profile-menu {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .user-name {
          font-size: 0.8125rem;
          font-weight: 500;
          color: #FFFFFF;
        }
        .user-role-tag {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          text-transform: uppercase;
          background-color: var(--color-header-sub);
          color: var(--color-ink);
          font-weight: 700;
          border: 1px solid var(--color-header-sub);
          padding: 2px 6px;
          border-radius: var(--radius-sm);
        }
        .mobile-toggle {
          display: none;
          background: none;
          border: 1px solid var(--color-rule);
          font-size: 1.25rem;
          padding: 4px 8px;
          color: var(--color-ink);
        }
        .mobile-nav-panel {
          display: flex;
          flex-direction: column;
          padding: var(--space-4) var(--space-6);
          background-color: var(--color-surface);
          border-bottom: var(--border-hairline);
        }
        .mobile-nav-link {
          padding: var(--space-2) 0;
          color: var(--color-ink);
          text-decoration: none;
          font-weight: 500;
        }
        .site-main {
          flex: 1;
          max-width: var(--container-max);
          width: 100%;
          margin: 0 auto;
          padding: var(--space-8) var(--space-6);
        }
        .site-footer {
          border-top: 3px solid var(--color-accent);
          background-color: var(--color-header-bg);
          color: var(--color-header-text);
          padding: var(--space-8) var(--space-6);
          margin-top: auto;
        }
        .footer-inner {
          max-width: var(--container-max);
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: var(--space-6);
        }
        .footer-caption {
          font-size: 0.8125rem;
          max-width: 480px;
          margin-top: var(--space-2);
          line-height: 1.5;
          color: var(--color-header-text);
          opacity: 0.9;
        }
        .meta-col {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          font-size: 0.75rem;
          color: var(--color-header-sub);
          text-align: right;
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none; }
          .mobile-toggle { display: block; }
          .meta-col { text-align: left; }
        }
      `}</style>
    </div>
  );
}

