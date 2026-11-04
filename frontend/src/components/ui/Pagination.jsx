import React from 'react';
import { Button } from './Button';

export function Pagination({
  page = 1,
  totalPages = 1,
  total = 0,
  limit = 10,
  onPageChange,
  className = '',
}) {
  if (totalPages <= 1) return null;

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  return (
    <nav className={`pagination-bar ${className}`} aria-label="Pagination">
      <div className="pagination-info text-muted">
        Showing <span className="tabular-nums font-mono">{startRecord}</span> to{' '}
        <span className="tabular-nums font-mono">{endRecord}</span> of{' '}
        <span className="tabular-nums font-mono">{total}</span> records
      </div>

      <div className="pagination-controls">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          ← Prev
        </Button>

        <span className="page-indicator tabular-nums font-mono">
          Page {page} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next →
        </Button>
      </div>

      <style>{`
        .pagination-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: var(--space-4);
          padding: var(--space-4) 0;
          border-top: var(--border-hairline);
          margin-top: var(--space-4);
          font-size: 0.875rem;
        }
        .pagination-controls {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .page-indicator {
          font-size: 0.8125rem;
          color: var(--color-ink);
        }
      `}</style>
    </nav>
  );
}

