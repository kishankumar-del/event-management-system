import React from 'react';
import { Button } from './Button';

export function EmptyState({
  title = 'No records found',
  message = 'There are no entries matching your current selection or query.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state-card">
        <div className="empty-stub-cutout left" />
        <div className="empty-stub-cutout right" />
        <h3 className="empty-title">{title}</h3>
        <p className="empty-message">{message}</p>
        {actionLabel && onAction ? (
          <div className="empty-action">
            <Button variant="outline" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          </div>
        ) : null}
      </div>
      <style>{`
        .empty-state {
          padding: var(--space-8) var(--space-4);
          display: flex;
          justify-content: center;
          text-align: center;
        }
        .empty-state-card {
          position: relative;
          background-color: var(--color-surface);
          border: 1px dashed var(--color-rule);
          padding: var(--space-8) var(--space-8);
          max-width: 480px;
          width: 100%;
        }
        .empty-title {
          font-family: var(--font-heading);
          font-style: italic;
          font-size: 1.35rem;
          color: var(--color-ink);
          margin-bottom: var(--space-2);
        }
        .empty-message {
          font-size: 0.875rem;
          color: var(--color-muted);
          line-height: 1.5;
        }
        .empty-action {
          margin-top: var(--space-4);
        }
      `}</style>
    </div>
  );
}

