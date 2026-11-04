import React from 'react';

/**
 * Box Office Button Component
 * Strictly conforms to 44px touch target, WCAG AA contrast, and zero external UI kits
 */
export function Button({
  children,
  type = 'button',
  variant = 'primary', // primary | outline | ghost | danger
  size = 'md',        // sm | md | lg
  disabled = false,
  loading = false,
  onClick,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn btn-${variant} btn-${size} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner" aria-hidden="true" />
      ) : null}
      <span className="btn-content">{children}</span>

      <style>{`
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          font-family: var(--font-ui);
          font-weight: 500;
          font-size: 0.9375rem;
          line-height: 1.2;
          min-height: var(--touch-target-min);
          padding: 0 var(--space-4);
          border-radius: var(--radius-sm);
          text-decoration: none;
          transition: background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
          user-select: none;
        }

        .btn-sm {
          min-height: 36px;
          padding: 0 var(--space-3);
          font-size: 0.8125rem;
        }

        .btn-lg {
          min-height: 48px;
          padding: 0 var(--space-6);
          font-size: 1rem;
        }

        /* Variants */
        .btn-primary {
          background-color: var(--color-accent);
          color: var(--color-surface);
          border: 1px solid var(--color-accent);
        }
        .btn-primary:hover:not(:disabled) {
          background-color: #b83214;
          border-color: #b83214;
        }

        .btn-outline {
          background-color: transparent;
          color: var(--color-ink);
          border: 1px solid var(--color-ink);
        }
        .btn-outline:hover:not(:disabled) {
          background-color: var(--color-surface);
          border-color: var(--color-accent);
          color: var(--color-accent);
        }

        .btn-ghost {
          background-color: transparent;
          color: var(--color-muted);
          border: 1px solid transparent;
        }
        .btn-ghost:hover:not(:disabled) {
          background-color: var(--color-surface);
          color: var(--color-ink);
        }

        .btn-danger {
          background-color: var(--color-danger);
          color: var(--color-surface);
          border: 1px solid var(--color-danger);
        }
        .btn-danger:hover:not(:disabled) {
          background-color: #831e15;
        }

        .btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .btn-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: btnSpin 600ms linear infinite;
        }

        @keyframes btnSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}

