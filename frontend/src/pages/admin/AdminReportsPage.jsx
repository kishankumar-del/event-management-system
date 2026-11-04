import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';

export function AdminReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/reports/admin');
      setReport(res.data);
    } catch (err) {
      setError(err.message || 'Failed to compile platform report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return <Spinner message="Aggregating global report..." />;
  }

  if (error || !report) {
    return <ErrorState message={error || 'Failed to generate report.'} onRetry={fetchReport} />;
  }

  const { kpis, topEvents = [], eventsByCategory = [], usersByRole = [] } = report;
  const maxRevenue = Math.max(...topEvents.map((t) => t.totalRevenue), 100);

  return (
    <div className="admin-reports-page">
      <div className="page-header-strip">
        <div>
          <span className="font-mono text-muted page-badge">GLOBAL METRICS</span>
          <h1 className="page-title">Platform-Wide Intelligence & Yield</h1>
          <p className="text-muted" style={{ fontSize: '0.9375rem' }}>
            Comprehensive analytics aggregated across all organizers, events, and bookings.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          Print Report
        </Button>
      </div>

      <div className="kpi-summary-row">
        <div className="kpi-card">
          <span className="kpi-label font-mono">TOTAL PLATFORM REVENUE</span>
          <span className="kpi-value tabular-nums font-mono" style={{ color: 'var(--color-accent)' }}>
            ${kpis.totalRevenue?.toFixed(2)}
          </span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label font-mono">TICKETS DISPATCHED</span>
          <span className="kpi-value tabular-nums font-mono">{kpis.totalTicketsSold}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label font-mono">PLATFORM ATTENDANCE RATE</span>
          <span className="kpi-value tabular-nums font-mono">{kpis.attendanceRate}%</span>
        </div>
      </div>

      {/* SVG Bar Chart for Top Events */}
      <section className="report-card" style={{ marginTop: 'var(--space-6)' }}>
        <h2 className="section-title">Top Revenue Events (Pure SVG / CSS Visualization)</h2>
        <div className="svg-bars-stack">
          {topEvents.map((ev) => {
            const widthPct = Math.max(5, Math.round((ev.totalRevenue / maxRevenue) * 100));
            return (
              <div key={ev.title} className="bar-entry">
                <div className="bar-entry-label">
                  <span style={{ fontWeight: 600 }}>{ev.title}</span>
                  <span className="text-muted font-mono" style={{ fontSize: '0.75rem' }}>
                    {ev.category} • {ev.ticketsSold} tix
                  </span>
                </div>
                <div className="bar-entry-track">
                  <div className="bar-entry-fill" style={{ width: `${widthPct}%` }}>
                    <span className="font-mono tabular-nums" style={{ color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>
                      ${ev.totalRevenue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <style>{`
        .admin-reports-page {
          max-width: var(--container-max);
          margin: 0 auto;
        }
        .page-header-strip {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
          border-bottom: var(--border-hairline);
          padding-bottom: var(--space-4);
        }
        .page-badge {
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          display: block;
          margin-bottom: var(--space-2);
        }
        .kpi-summary-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: var(--space-4);
        }
        .kpi-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-rule);
          padding: var(--space-5);
        }
        .kpi-label {
          font-size: 0.6875rem;
          color: var(--color-muted);
          letter-spacing: 0.08em;
          display: block;
          margin-bottom: var(--space-1);
        }
        .kpi-value {
          font-size: 1.85rem;
          font-weight: 700;
        }
        .report-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-rule);
          padding: var(--space-6);
        }
        .svg-bars-stack {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          margin-top: var(--space-4);
        }
        .bar-entry {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: var(--space-4);
          align-items: center;
        }
        .bar-entry-label {
          display: flex;
          flex-direction: column;
        }
        .bar-entry-track {
          width: 100%;
          background-color: var(--color-paper);
          height: 30px;
          border-radius: var(--radius-sm);
          overflow: hidden;
        }
        .bar-entry-fill {
          background-color: var(--color-accent);
          height: 100%;
          display: flex;
          align-items: center;
          padding: 0 var(--space-3);
          min-width: 60px;
        }
        @media (max-width: 640px) {
          .bar-entry { grid-template-columns: 1fr; gap: var(--space-1); }
        }
      `}</style>
    </div>
  );
}

