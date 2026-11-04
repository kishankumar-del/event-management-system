import React from 'react';

export function Spinner({ message = 'Loading...', size = 'md', className = '' }) {
  return (
    <div className={`spinner-container ${className}`} role="status">
      <div className={`spinner-graphic spinner-${size}`} />
      {message ? <span className="spinner-message">{message}</span> : null}
      <style>{`
        .spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-8);
          gap: var(--space-3);
        }
        .spinner-graphic {
          border: 2px solid var(--color-rule);
          border-top-color: var(--color-accent);
          border-radius: 50%;
          animation: spin 700ms linear infinite;
        }
        .spinner-sm { width: 18px; height: 18px; }
        .spinner-md { width: 32px; height: 32px; }
        .spinner-lg { width: 48px; height: 48px; }
        .spinner-message {
          font-family: var(--font-ui);
          font-size: 0.875rem;
          color: var(--color-muted);
          font-style: italic;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

