import React from 'react';
import { Button } from './Button';

export function ErrorState({
  title = 'Something went wrong',
  message = 'Failed to load data from the server. Please check your connection and try again.',
  onRetry,
  className = '',
}) {
  return (
    <div className={`error-state ${className}`} role="alert">
      <div className="error-badge">ERROR</div>
      <h3 className="error-title">{title}</h3>
      <p className="error-message">{message}</p>
      {onRetry ? (
        <div className="error-action">
          <Button variant="danger" size="sm" onClick={onRetry}>
            Retry Request
          </Button>
        </div>
      ) : null}
      <style>{`
        .error-state {
          padding: var(--space-6);
          background-color: var(--color-surface);
          border: 1px solid var(--color-danger);
          border-left: 4px solid var(--color-danger);
          margin: var(--space-4) 0;
        }
        .error-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-danger);
          letter-spacing: 0.05em;
          margin-bottom: var(--space-1);
        }
        .error-title {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          color: var(--color-ink);
          margin-bottom: var(--space-1);
        }
        .error-message {
          font-size: 0.875rem;
          color: var(--color-muted);
          line-height: 1.4;
        }
        .error-action {
          margin-top: var(--space-3);
        }
      `}</style>
    </div>
  );
}

