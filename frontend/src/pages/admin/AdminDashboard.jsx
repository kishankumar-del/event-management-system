import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';

export function AdminDashboard() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/reports/admin');
      setReport(res.data);
    } catch (err) {
      setError(err.message || 'Failed to compile platform metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminReport();
  }, []);

  if (loading) {
    return <Spinner message="Compiling platform-wide intelligence..." />;
  }

  if (error || !report) {
    return <ErrorState message={error || 'Failed to load admin data.'} onRetry={fetchAdminReport} />;
  }

  const { kpis, topEvents = [], eventsByCategory = [], usersByRole = [] } = report;

  return (
    <div className="admin-dash-page">
      <div className="admin-header-strip">
        <div>
          <span className="font-mono text-muted admin-badge">CENTRAL PLATFORM DESK</span>
          <h1 className="page-title">Global Operations & Platform Oversight</h1>
          <p className="text-muted" style={{ fontSize: '0.9375rem' }}>
            System-wide statistics aggregated directly from MongoDB collections.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link to="/admin/users">
            <Button variant="primary">Manage Users →</Button>
          </Link>
        </div>
      </div>

      {/* Global KPIs */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <span className="kpi-label font-mono">TOTAL REGISTERED USERS</span>
          <span className="kpi-value tabular-nums font-mono">{kpis.totalUsers}</span>
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>Attendees, Organizers & Staff</span>
        </div>

        <div className="admin-kpi-card">
          <span className="kpi-label font-mono">TOTAL PRODUCTIONS</span>
          <span className="kpi-value tabular-nums font-mono">{kpis.totalEvents}</span>
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>Scheduled across all venues</span>
        </div>

        <div className="admin-kpi-card">
          <span className="kpi-label font-mono">TOTAL ADMISSION ORDERS</span>
          <span className="kpi-value tabular-nums font-mono">{kpis.totalRegistrations}</span>
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>{kpis.totalTicketsSold} tickets sold</span>
        </div>

        <div className="admin-kpi-card">
          <span className="kpi-label font-mono">GROSS SETTLEMENT VOLUME</span>
          <span className="kpi-value tabular-nums font-mono admin-accent">
            ${kpis.totalRevenue?.toFixed(2)}
          </span>
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>Across all payment gateways</span>
        </div>
      </div>

      {/* Top 5 Revenue Events */}
      <section className="admin-section" style={{ marginTop: 'var(--space-8)' }}>
        <h2 className="section-title">Top Revenue Generating Events</h2>
        <div className="admin-top-table">
          <div className="table-row-head font-mono text-muted">
            <span>EVENT TITLE</span>
            <span>CATEGORY</span>
            <span>TICKETS SOLD</span>
            <span>SETTLED REVENUE</span>
          </div>
          {topEvents.map((t) => (
            <div key={t.title} className="table-row-body">
              <span style={{ fontWeight: 600 }}>{t.title}</span>
              <span className="font-mono text-muted">{t.category}</span>
              <span className="tabular-nums font-mono">{t.ticketsSold}</span>
              <span className="tabular-nums font-mono" style={{ fontWeight: 700, color: 'var(--color-accent)' }}>
                ${t.totalRevenue.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Split Grids: Category distribution & Role counts */}
      <div className="admin-split-grid" style={{ marginTop: 'var(--space-8)' }}>
        <section className="admin-section">
          <h2 className="section-title" style={{ fontSize: '1.25rem' }}>
            Events by Category
          </h2>
          <div className="category-bars">
            {eventsByCategory.map((c) => (
              <div key={c._id} className="category-bar-item">
                <span className="cat-name">{c._id}</span>
                <span className="cat-count font-mono tabular-nums">{c.count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-section">
          <h2 className="section-title" style={{ fontSize: '1.25rem' }}>
            Users by Role
          </h2>
          <div className="category-bars">
            {usersByRole.map((r) => (
              <div key={r._id} className="category-bar-item">
                <span className="cat-name font-mono" style={{ textTransform: 'capitalize' }}>
                  {r._id}
                </span>
                <span className="cat-count font-mono tabular-nums">{r.count}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        .admin-dash-page {
          max-width: var(--container-max);
          margin: 0 auto;
        }
        .admin-header-strip {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: var(--space-4);
          margin-bottom: var(--space-8);
          border-bottom: var(--border-hairline);
          padding-bottom: var(--space-6);
        }
        .admin-badge {
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          display: block;
          margin-bottom: var(--space-2);
        }
        .admin-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: var(--space-4);
        }
        .admin-kpi-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-rule);
          border-top: 4px solid var(--color-accent);
          border-radius: var(--radius-md);
          box-shadow: 0 1px 4px rgba(85, 123, 131, 0.08);
          padding: var(--space-5);
          display: flex;
          flex-direction: column;
        }
        .admin-accent {
          color: var(--color-accent);
        }
        .admin-section {
          background-color: var(--color-surface);
          border: 1px solid var(--color-rule);
          border-radius: var(--radius-md);
          box-shadow: 0 1px 4px rgba(85, 123, 131, 0.08);
          padding: var(--space-6);
        }
        .admin-top-table {
          display: flex;
          flex-direction: column;
        }
        .table-row-head, .table-row-body {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          padding: var(--space-3) 0;
          border-bottom: 1px solid var(--color-rule);
          font-size: 0.875rem;
          align-items: center;
        }
        .table-row-head {
          font-size: 0.75rem;
          font-weight: 600;
        }
        .admin-split-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-6);
        }
        .category-bars {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-top: var(--space-4);
        }
        .category-bar-item {
          display: flex;
          justify-content: space-between;
          padding: var(--space-2) var(--space-3);
          background-color: var(--color-paper);
          border: 1px solid var(--color-rule);
          font-size: 0.875rem;
        }
        @media (max-width: 640px) {
          .admin-split-grid { grid-template-columns: 1fr; }
          .table-row-head, .table-row-body {
            grid-template-columns: 1fr 1fr;
            gap: var(--space-2);
          }
        }
      `}</style>
    </div>
  );
}

