import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';

export function OrganizerDashboard() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/reports/organizer');
      setReport(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return <Spinner message="Compiling organizer performance metrics..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchReport} />;
  }

  const kpis = report?.kpis || {};
  const recentEvents = report?.events || [];

  return (
    <div className="organizer-dash-page">
      {/* Header with Quick Actions */}
      <div className="dash-heading-strip">
        <div>
          <span className="font-mono text-muted dash-eyebrow">EXECUTIVE BENCH</span>
          <h1 className="page-title">Organizer Operations Desk</h1>
          <p className="text-muted" style={{ fontSize: '0.9375rem' }}>
            Live box office admissions, revenue yield, and gate check-in statistics.
          </p>
        </div>

        <div className="dash-quick-actions">
          <Link to="/organizer/events/new">
            <Button variant="primary">+ Create Event</Button>
          </Link>
          <Link to="/organizer/venues">
            <Button variant="outline">+ Add Venue</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row (Flat Box Office Style, No Card In Card) */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label font-mono">TOTAL MANAGED EVENTS</span>
          <span className="kpi-value tabular-nums font-mono">{kpis.totalEvents || 0}</span>
          <span className="kpi-sub text-muted">Across all seasons</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label font-mono">ADMISSION BOOKINGS</span>
          <span className="kpi-value tabular-nums font-mono">{kpis.totalRegistrations || 0}</span>
          <span className="kpi-sub text-muted">{kpis.totalTicketsSold || 0} tickets allocated</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label font-mono">TOTAL REVENUE YIELD</span>
          <span className="kpi-value tabular-nums font-mono kpi-accent">
            ${(kpis.totalRevenue || 0).toFixed(2)}
          </span>
          <span className="kpi-sub text-muted">Settled payments</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label font-mono">GATE CHECK-IN RATE</span>
          <span className="kpi-value tabular-nums font-mono">{kpis.attendanceRate || 0}%</span>
          <span className="kpi-sub text-muted">Verified at door</span>
        </div>
      </div>

      {/* Quick Navigation Panels */}
      <div className="desk-shortcuts-grid">
        <Link to="/organizer/registrations" className="shortcut-card">
          <div className="shortcut-title">Door Check-In & Roster →</div>
          <p className="shortcut-desc text-muted">
            Search admission codes (e.g. REG-8K9A2M) and toggle one-click attendee check-ins.
          </p>
        </Link>

        <Link to="/organizer/reports" className="shortcut-card">
          <div className="shortcut-title">Visual Aggregation Reports →</div>
          <p className="shortcut-desc text-muted">
            Inspect pure SVG/CSS revenue distribution by event, tier sellout curves, and attendance rates.
          </p>
        </Link>
      </div>

      {/* Managed Events Overview */}
      <section className="dash-section" style={{ marginTop: 'var(--space-8)' }}>
        <div className="section-head-bar">
          <h2 className="section-title">Active Programmes</h2>
          <Link to="/organizer/events" style={{ fontSize: '0.875rem' }}>
            View Full Table →
          </Link>
        </div>

        {recentEvents.length === 0 ? (
          <div className="empty-events-banner text-muted">
            No events configured yet. Create your first event to start admissions.
          </div>
        ) : (
          <div className="recent-events-list">
            {recentEvents.map((ev) => (
              <div key={ev._id} className="event-summary-item">
                <div className="ev-left">
                  <Badge status={ev.status} />
                  <span className="ev-title" style={{ fontWeight: 600 }}>{ev.title}</span>
                  <span className="ev-cat text-muted font-mono" style={{ fontSize: '0.75rem' }}>
                    • {ev.category}
                  </span>
                </div>
                <div className="ev-right">
                  <span className="ev-cap font-mono tabular-nums text-muted" style={{ fontSize: '0.8125rem' }}>
                    CAP: {ev.capacity}
                  </span>
                  <Link to={`/organizer/events/${ev._id}/edit`}>
                    <Button variant="outline" size="sm">
                      Manage Event
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <style>{`
        .organizer-dash-page {
          max-width: var(--container-max);
          margin: 0 auto;
        }
        .dash-heading-strip {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: var(--space-4);
          margin-bottom: var(--space-8);
          border-bottom: var(--border-hairline);
          padding-bottom: var(--space-6);
        }
        .dash-eyebrow {
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          display: block;
          margin-bottom: var(--space-2);
        }
        .dash-quick-actions {
          display: flex;
          gap: var(--space-3);
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: var(--space-4);
          margin-bottom: var(--space-8);
        }
        .kpi-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-rule);
          border-top: 4px solid var(--color-accent);
          border-radius: var(--radius-md);
          box-shadow: 0 1px 4px rgba(85, 123, 131, 0.08);
          padding: var(--space-5);
          display: flex;
          flex-direction: column;
        }
        .kpi-label {
          font-size: 0.6875rem;
          color: var(--color-muted);
          letter-spacing: 0.08em;
          margin-bottom: var(--space-1);
        }
        .kpi-value {
          font-size: 2rem;
          font-weight: 700;
          line-height: 1.1;
          color: var(--color-ink);
        }
        .kpi-accent {
          color: var(--color-accent);
        }
        .kpi-sub {
          font-size: 0.75rem;
          margin-top: var(--space-2);
        }
        .desk-shortcuts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: var(--space-4);
        }
        .shortcut-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-rule);
          border-radius: var(--radius-md);
          box-shadow: 0 1px 4px rgba(85, 123, 131, 0.08);
          padding: var(--space-5);
          text-decoration: none;
          color: inherit;
          transition: all var(--transition-fast);
        }
        .shortcut-card:hover {
          border-color: var(--color-accent);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(85, 123, 131, 0.12);
        }
        .shortcut-title {
          font-family: var(--font-heading);
          font-size: 1.1875rem;
          font-weight: 600;
          color: var(--color-ink);
          margin-bottom: var(--space-1);
        }
        .shortcut-desc {
          font-size: 0.8125rem;
          line-height: 1.5;
        }
        .section-head-bar {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: var(--space-4);
          border-bottom: 1px solid var(--color-rule);
          padding-bottom: var(--space-2);
        }
        .recent-events-list {
          display: flex;
          flex-direction: column;
          background-color: var(--color-surface);
          border: 1px solid var(--color-rule);
        }
        .event-summary-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          border-bottom: 1px solid var(--color-rule);
          flex-wrap: wrap;
          gap: var(--space-2);
        }
        .event-summary-item:last-child {
          border-bottom: none;
        }
        .ev-left {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .ev-right {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .empty-events-banner {
          background-color: var(--color-surface);
          border: 1px dashed var(--color-rule);
          padding: var(--space-6);
          text-align: center;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

