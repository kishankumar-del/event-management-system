import React from 'react';

export function Table({ children, className = '' }) {
  return (
    <div className="table-responsive-wrapper">
      <table className={`data-table ${className}`}>{children}</table>
      <style>{`
        .table-responsive-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          margin-bottom: var(--space-4);
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.875rem;
          background-color: var(--color-surface);
          border: 1px solid var(--color-rule);
        }
        .data-table th {
          background-color: var(--color-paper);
          color: var(--color-ink);
          font-family: var(--font-ui);
          font-weight: 600;
          padding: var(--space-3) var(--space-4);
          border-bottom: 1px solid var(--color-rule);
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }
        .data-table td {
          padding: var(--space-3) var(--space-4);
          border-bottom: 1px solid var(--color-rule);
          color: var(--color-ink);
          vertical-align: middle;
        }
        .data-table tbody tr:last-child td {
          border-bottom: none;
        }
        .data-table tbody tr:hover {
          background-color: var(--color-surface-hover);
        }

        /* Mobile stacked responsive view */
        @media (max-width: 640px) {
          .data-table, .data-table thead, .data-table tbody, .data-table th, .data-table td, .data-table tr {
            display: block;
          }
          .data-table thead tr {
            position: absolute;
            top: -9999px;
            left: -9999px;
          }
          .data-table tbody tr {
            border-bottom: 2px solid var(--color-rule);
            padding: var(--space-3) 0;
          }
          .data-table td {
            border: none;
            position: relative;
            padding-left: 45%;
            padding-top: var(--space-1);
            padding-bottom: var(--space-1);
          }
          .data-table td::before {
            position: absolute;
            left: var(--space-3);
            width: 40%;
            padding-right: 10px;
            white-space: nowrap;
            font-weight: 600;
            color: var(--color-muted);
            content: attr(data-label);
            font-size: 0.75rem;
            text-transform: uppercase;
          }
        }
      `}</style>
    </div>
  );
}

