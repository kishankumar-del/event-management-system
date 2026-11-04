import React from 'react';

const STATUS_VARIANTS = {
  // Success (green)
  confirmed: 'success',
  published: 'success',
  paid: 'success',
  checked_in: 'success',
  active: 'success',

  // Pending (amber)
  draft: 'pending',
  pending: 'pending',

  // Danger (stamp red)
  cancelled: 'danger',
  failed: 'danger',
  refunded: 'danger',
  no_show: 'danger',
  inactive: 'danger',

  // Default muted
  completed: 'muted',
  attendee: 'muted',
  organizer: 'accent',
  admin: 'accent',
};

export function Badge({ status, label, variant, className = '' }) {
  const resolvedVariant = variant || STATUS_VARIANTS[status?.toLowerCase()] || 'muted';
  const displayLabel = label || status?.replace('_', ' ') || '';

  return (
    <span className={`badge badge-${resolvedVariant} ${className}`}>
      {displayLabel}
      <style>{`
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 2px var(--space-2);
          border-radius: var(--radius-sm);
          font-family: var(--font-ui);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          line-height: 1.2;
          white-space: nowrap;
        }
        .badge-success {
          background-color: #EBF3ED;
          color: var(--color-success);
          border: 1px solid var(--color-success);
        }
        .badge-pending {
          background-color: #FEF7EC;
          color: var(--color-pending);
          border: 1px solid var(--color-pending);
        }
        .badge-danger {
          background-color: #FDF0ED;
          color: var(--color-danger);
          border: 1px solid var(--color-danger);
        }
        .badge-muted {
          background-color: var(--color-surface);
          color: var(--color-muted);
          border: 1px solid var(--color-rule);
        }
        .badge-accent {
          background-color: #FDF0ED;
          color: var(--color-accent);
          border: 1px solid var(--color-accent);
        }
      `}</style>
    </span>
  );
}

