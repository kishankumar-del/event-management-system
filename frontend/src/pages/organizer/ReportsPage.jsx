import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';

export function ReportsPage() {
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
      setError(err.message || 'Failed to load report analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return <Spinner message="Aggregating database analytics..." />;
  }

  if (error || !report) {
    return <ErrorState message={error || 'Failed to generate report.'} onRetry={fetchReport} />;
  }

  const { kpis, revenueByEvent = [], attendanceBreakdown = {}, ticketTierSales = [] } = report;

  // Max revenue for scaling SVG bar chart
  const maxRevenue = Math.max(...revenueByEvent.map((r) => r.totalRevenue), 100);

  const totalAttendanceCount =
    (attendanceBreakdown.checked_in || 0) +
    (attendanceBreakdown.pending || 0) +
    (attendanceBreakdown.no_show || 0);

  const checkedInPercent = totalAttendanceCount > 0
    ? Math.round((attendanceBreakdown.checked_in / totalAttendanceCount) * 100)
    : 0;
  const pendingPercent = totalAttendanceCount > 0
    ? Math.round((attendanceBreakdown.pending / totalAttendanceCount) * 100)
    : 0;
  const noShowPercent = totalAttendanceCount > 0
    ? Math.round((attendanceBreakdown.no_show / totalAttendanceCount) * 100)
    : 0;

  return (
    <div className="reports-analytics-page">
      <div className="page-header-strip">
        <div>
          <span className="font-mono text-muted page-badge">MONGODB AGGREGATION ENGINE</span>
          <h1 className="page-title">Executive Performance & Yield Reports</h1>
          <p className="text-muted" style={{ fontSize: '0.9375rem' }}>
            Real-time server-side aggregations computed across booking records, door scans, and settlement gateways.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => window.print()}>
          Print Report Summary
        </Button>
      </div>

      {/* KPI Headline Metrics */}
      <div className="report-kpi-row">
        <div className="report-kpi-item">
          <span className="kpi-label font-mono">AGGREGATE REVENUE</span>
          <span className="kpi-value tabular-nums font-mono report-accent">
            ₹{(kpis.totalRevenue || 0).toFixed(2)}
          </span>
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>From paid settlements</span>
        </div>

        <div className="report-kpi-item">
          <span className="kpi-label font-mono">TICKETS ALLOCATED</span>
          <span className="kpi-value tabular-nums font-mono">{kpis.totalTicketsSold || 0}</span>
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>Across confirmed orders</span>
        </div>

        <div className="report-kpi-item">
          <span className="kpi-label font-mono">DOOR ATTENDANCE RATE</span>
          <span className="kpi-value tabular-nums font-mono">{kpis.attendanceRate || 0}%</span>
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>Checked in at door</span>
        </div>

        <div className="report-kpi-item">
          <span className="kpi-label font-mono">PRODUCTIONS</span>
          <span className="kpi-value tabular-nums font-mono">{kpis.totalEvents || 0}</span>
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>Under management</span>
        </div>
      </div>

      {/* Chart 1: Revenue by Event (Pure SVG & CSS Horizontal Bars) */}
      <section className="report-section">
        <h2 className="section-title">1. Revenue Yield by Production (INR ₹)</h2>
        <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: 'var(--space-4)' }}>
          Calculated by grouping confirmed registration payments by event ID.
        </p>

        {revenueByEvent.length === 0 ? (
          <div className="empty-chart-note text-muted">No revenue records generated yet.</div>
        ) : (
          <div className="svg-bar-chart-container">
            {revenueByEvent.map((item) => {
              const barWidthPercent = Math.max(4, Math.round((item.totalRevenue / maxRevenue) * 100));

              return (
                <div key={item.eventId} className="chart-bar-row">
                  <div className="bar-label-col">
                    <span className="bar-title" title={item.title}>{item.title}</span>
                    <span className="bar-meta text-muted font-mono">
                      {item.totalTickets} tix • {item.category}
                    </span>
                  </div>

                  <div className="bar-track-col">
                    <div
                      className="bar-fill"
                      style={{ width: `${barWidthPercent}%` }}
                      role="progressbar"
                      aria-valuenow={item.totalRevenue}
                      aria-valuemin="0"
                      aria-valuemax={maxRevenue}
                    >
                      <span className="bar-inner-text tabular-nums font-mono">
                        ₹{item.totalRevenue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Chart 2: Gate Attendance Rate Breakdown */}
      <section className="report-section" style={{ marginTop: 'var(--space-8)' }}>
        <h2 className="section-title">2. Gate Attendance Verification Rate</h2>
        <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: 'var(--space-4)' }}>
          Proportional split of attendee statuses scanned at the door.
        </p>

        <div className="attendance-stacked-bar">
          <div
            className="seg seg-checked-in"
            style={{ width: `${checkedInPercent}%` }}
            title={`Checked In: ${attendanceBreakdown.checked_in || 0} (${checkedInPercent}%)`}
          />
          <div
            className="seg seg-pending"
            style={{ width: `${pendingPercent}%` }}
            title={`Pending: ${attendanceBreakdown.pending || 0} (${pendingPercent}%)`}
          />
          <div
            className="seg seg-no-show"
            style={{ width: `${noShowPercent}%` }}
            title={`No Show: ${attendanceBreakdown.no_show || 0} (${noShowPercent}%)`}
          />
        </div>

        <div className="attendance-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: 'var(--color-success)' }} />
            <span>Checked In: <strong className="tabular-nums font-mono">{attendanceBreakdown.checked_in || 0}</strong> ({checkedInPercent}%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: 'var(--color-pending)' }} />
            <span>Pending Door Scan: <strong className="tabular-nums font-mono">{attendanceBreakdown.pending || 0}</strong> ({pendingPercent}%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: 'var(--color-danger)' }} />
            <span>No Show: <strong className="tabular-nums font-mono">{attendanceBreakdown.no_show || 0}</strong> ({noShowPercent}%)</span>
          </div>
        </div>
      </section>

      {/* Chart 3: Ticket Tier Sales Progress */}
      <section className="report-section" style={{ marginTop: 'var(--space-8)' }}>
        <h2 className="section-title">3. Ticket Tier Quota Realization</h2>
        <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: 'var(--space-4)' }}>
          Proportion of allocated seats sold per ticket tier across your active programmes.
        </p>

        <div className="tier-realization-grid">
          {ticketTierSales.map((t, idx) => (
            <div key={idx} className="tier-progress-card">
              <div className="tier-card-head">
                <span className="tier-title">{t.tierName}</span>
                <span className="tabular-nums font-mono text-muted">₹{t.price.toFixed(2)}</span>
              </div>
              <div className="tier-card-event text-muted">{t.eventTitle}</div>

              <div className="tier-progress-track">
                <div
                  className="tier-progress-fill"
                  style={{ width: `${Math.min(100, t.percentSold)}%` }}
                />
              </div>

              <div className="tier-card-foot font-mono tabular-nums">
                <span>{t.quantitySold} / {t.quantityTotal} Sold</span>
                <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>
                  {t.percentSold}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        .reports-analytics-page {
          max-width: var(--container-max);
          margin: 0 auto;
        }
        .page-header-strip {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: var(--space-4);
          margin-bottom: var(--space-8);
          border-bottom: var(--border-hairline);
          padding-bottom: var(--space-6);
        }
        .page-badge {
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          display: block;
          margin-bottom: var(--space-2);
        }
        .report-kpi-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-4);
          margin-bottom: var(--space-8);
        }
        .report-kpi-item {
          background-color: var(--color-surface);
          border: 1px solid var(--color-rule);
          padding: var(--space-5);
          display: flex;
          flex-direction: column;
        }
        .report-accent {
          color: var(--color-accent);
        }
        .report-section {
          background-color: var(--color-surface);
          border: 1px solid var(--color-rule);
          padding: var(--space-6);
        }
        .empty-chart-note {
          padding: var(--space-6);
          font-style: italic;
          text-align: center;
        }

        /* SVG / CSS Bars */
        .svg-bar-chart-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .chart-bar-row {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: var(--space-4);
          align-items: center;
        }
        .bar-label-col {
          display: flex;
          flex-direction: column;
        }
        .bar-title {
          font-weight: 600;
          font-size: 0.875rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .bar-meta {
          font-size: 0.75rem;
        }
        .bar-track-col {
          width: 100%;
          background-color: var(--color-paper);
          height: 32px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          display: flex;
        }
        .bar-fill {
          background-color: var(--color-accent);
          height: 100%;
          display: flex;
          align-items: center;
          padding: 0 var(--space-3);
          transition: width 400ms ease;
          min-width: 60px;
        }
        .bar-inner-text {
          color: var(--color-surface);
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
        }

        /* Attendance Stacked Bar */
        .attendance-stacked-bar {
          display: flex;
          height: 28px;
          width: 100%;
          background-color: var(--color-paper);
          border: 1px solid var(--color-rule);
          overflow: hidden;
          border-radius: var(--radius-sm);
          margin-bottom: var(--space-4);
        }
        .seg-checked-in { background-color: var(--color-success); }
        .seg-pending { background-color: var(--color-pending); }
        .seg-no-show { background-color: var(--color-danger); }

        .attendance-legend {
          display: flex;
          gap: var(--space-6);
          flex-wrap: wrap;
          font-size: 0.8125rem;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        /* Tier Realization Grid */
        .tier-realization-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: var(--space-4);
        }
        .tier-progress-card {
          background-color: var(--color-paper);
          border: 1px solid var(--color-rule);
          padding: var(--space-4);
        }
        .tier-card-head {
          display: flex;
          justify-content: space-between;
          font-weight: 600;
          font-size: 0.875rem;
        }
        .tier-card-event {
          font-size: 0.75rem;
          margin-bottom: var(--space-3);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tier-progress-track {
          height: 8px;
          background-color: var(--color-surface);
          border: 1px solid var(--color-rule);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: var(--space-2);
        }
        .tier-progress-fill {
          height: 100%;
          background-color: var(--color-accent);
          transition: width 300ms ease;
        }
        .tier-card-foot {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--color-muted);
        }

        @media (max-width: 640px) {
          .chart-bar-row { grid-template-columns: 1fr; gap: var(--space-1); }
        }
      `}</style>
    </div>
  );
}

