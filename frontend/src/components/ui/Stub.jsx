import React from 'react';
import { Badge } from './Badge';

/**
 * The Signature "Box Office" Ticket Stub Component
 * Features notched corners, dashed perforated tear-line, stamp-red edge, and small-caps registration code.
 */
export function Stub({
  registrationCode = 'REG-SAMPLE',
  eventTitle = 'Symphonia Concert',
  venueName = 'Grand Opera House',
  venueCity = 'New York',
  eventDate,
  ticketTier = 'General Admission',
  quantity = 1,
  price = 0,
  attendeeName = 'Valued Guest',
  status = 'confirmed',
  attendance = 'pending',
  actions,
  className = '',
}) {
  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Date TBA';

  const formattedTime = eventDate
    ? new Date(eventDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <article className={`ticket-stub ${className}`}>
      {/* Main Ticket Body */}
      <div className="stub-body">
        <div className="stub-header">
          <div className="stub-brand">BOX OFFICE ADMISSION</div>
          <div className="stub-badges">
            <Badge status={status} />
            {status === 'confirmed' ? (
              <Badge status={attendance} label={`Attendance: ${attendance}`} />
            ) : null}
          </div>
        </div>

        <h3 className="stub-event-title">{eventTitle}</h3>

        <div className="stub-details-grid">
          <div className="stub-detail-item">
            <span className="stub-label">VENUE</span>
            <span className="stub-val">{venueName}, {venueCity}</span>
          </div>
          <div className="stub-detail-item">
            <span className="stub-label">DATE & TIME</span>
            <span className="stub-val tabular-nums font-mono">
              {formattedDate} {formattedTime ? `• ${formattedTime}` : ''}
            </span>
          </div>
          <div className="stub-detail-item">
            <span className="stub-label">TIER</span>
            <span className="stub-val">{ticketTier}</span>
          </div>
          <div className="stub-detail-item">
            <span className="stub-label">GUEST</span>
            <span className="stub-val">{attendeeName}</span>
          </div>
        </div>
      </div>

      {/* Perforated Divider with Notched Corner Cutouts */}
      <div className="stub-divider">
        <div className="stub-notch top" />
        <div className="stub-perforation" />
        <div className="stub-notch bottom" />
      </div>

      {/* Detachable Stub Slip */}
      <div className="stub-slip">
        <div className="stub-accent-bar" />
        <div className="stub-slip-header">
          <span className="stub-label">REGISTRATION CODE</span>
          <div className="stub-code font-mono">{registrationCode}</div>
        </div>

        <div className="stub-slip-meta">
          <div>
            <span className="stub-label">QTY</span>
            <span className="stub-val tabular-nums font-mono">{quantity}</span>
          </div>
          <div>
            <span className="stub-label">TOTAL</span>
            <span className="stub-val tabular-nums font-mono">
              ₹{(price * quantity).toFixed(2)}
            </span>
          </div>
        </div>

        {/* CSS Barcode Emulation */}
        <div className="stub-barcode" aria-hidden="true">
          <span style={{ width: 2 }} /><span style={{ width: 1 }} /><span style={{ width: 3 }} />
          <span style={{ width: 1 }} /><span style={{ width: 4 }} /><span style={{ width: 2 }} />
          <span style={{ width: 1 }} /><span style={{ width: 3 }} /><span style={{ width: 1 }} />
          <span style={{ width: 2 }} /><span style={{ width: 4 }} /><span style={{ width: 1 }} />
          <span style={{ width: 3 }} /><span style={{ width: 2 }} /><span style={{ width: 1 }} />
          <span style={{ width: 4 }} /><span style={{ width: 2 }} /><span style={{ width: 1 }} />
        </div>

        {actions ? <div className="stub-actions">{actions}</div> : null}
      </div>

      <style>{`
        .ticket-stub {
          position: relative;
          display: flex;
          background-color: var(--color-surface);
          border: 1px solid var(--color-rule);
          border-radius: var(--radius-sm);
          overflow: hidden;
          margin-bottom: var(--space-4);
          transition: border-color var(--transition-fast);
        }
        .ticket-stub:hover {
          border-color: var(--color-muted);
        }

        /* Body */
        .stub-body {
          flex: 1;
          padding: var(--space-5) var(--space-6);
          min-width: 0;
        }
        .stub-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
        }
        .stub-brand {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: var(--color-muted);
        }
        .stub-badges {
          display: flex;
          gap: var(--space-2);
        }
        .stub-event-title {
          font-family: var(--font-heading);
          font-style: italic;
          font-size: 1.5rem;
          line-height: 1.25;
          color: var(--color-ink);
          margin-bottom: var(--space-4);
        }
        .stub-details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: var(--space-3) var(--space-6);
        }
        .stub-detail-item {
          display: flex;
          flex-direction: column;
        }
        .stub-label {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: var(--color-muted);
          margin-bottom: 2px;
        }
        .stub-val {
          font-size: 0.875rem;
          color: var(--color-ink);
          font-weight: 500;
        }

        /* Perforated Divider with Notches */
        .stub-divider {
          position: relative;
          width: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
        }
        .stub-perforation {
          width: 0;
          height: 100%;
          border-left: 2px dashed var(--color-rule);
        }
        .stub-notch {
          position: absolute;
          width: 16px;
          height: 16px;
          background-color: var(--color-paper);
          border: 1px solid var(--color-rule);
          border-radius: 50%;
          z-index: 2;
          left: -8px;
        }
        .stub-notch.top {
          top: -9px;
        }
        .stub-notch.bottom {
          bottom: -9px;
        }

        /* Detachable Slip */
        .stub-slip {
          position: relative;
          width: 210px;
          flex-shrink: 0;
          padding: var(--space-5) var(--space-4);
          background-color: var(--color-surface-subtle);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: center;
        }
        .stub-accent-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background-color: var(--color-accent);
        }
        .stub-slip-header {
          margin-bottom: var(--space-3);
        }
        .stub-code {
          font-size: 1.125rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--color-accent);
          margin-top: 4px;
        }
        .stub-slip-meta {
          display: flex;
          justify-content: space-around;
          margin-bottom: var(--space-3);
          border-top: 1px solid var(--color-rule);
          border-bottom: 1px solid var(--color-rule);
          padding: var(--space-2) 0;
        }
        .stub-barcode {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
          height: 28px;
          margin: var(--space-2) 0;
          opacity: 0.85;
        }
        .stub-barcode span {
          background-color: var(--color-ink);
          height: 100%;
          display: inline-block;
        }
        .stub-actions {
          margin-top: var(--space-2);
        }

        /* Mobile View: Stubs Stack Vertically */
        @media (max-width: 680px) {
          .ticket-stub {
            flex-direction: column;
          }
          .stub-divider {
            width: 100%;
            height: 0;
            flex-direction: row;
          }
          .stub-perforation {
            width: 100%;
            height: 0;
            border-left: none;
            border-top: 2px dashed var(--color-rule);
          }
          .stub-notch.top {
            left: -9px;
            top: -8px;
          }
          .stub-notch.bottom {
            left: auto;
            right: -9px;
            bottom: -8px;
          }
          .stub-slip {
            width: 100%;
            padding: var(--space-4) var(--space-5);
          }
        }
      `}</style>
    </article>
  );
}

