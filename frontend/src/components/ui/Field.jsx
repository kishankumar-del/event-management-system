import React from 'react';

export function Field({
  label,
  error,
  hint,
  required = false,
  htmlFor,
  children,
  className = '',
}) {
  return (
    <div className={`form-field ${error ? 'has-error' : ''} ${className}`}>
      {label ? (
        <label htmlFor={htmlFor} className="field-label">
          {label}
          {required ? <span className="field-required" aria-hidden="true"> *</span> : null}
        </label>
      ) : null}

      <div className="field-control">{children}</div>

      {hint && !error ? <p className="field-hint">{hint}</p> : null}
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}

      <style>{`
        .form-field {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          margin-bottom: var(--space-4);
        }
        .field-label {
          font-family: var(--font-ui);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-ink);
        }
        .field-required {
          color: var(--color-accent);
          font-weight: bold;
        }
        .field-hint {
          font-size: 0.8125rem;
          color: var(--color-muted);
          margin-top: 2px;
        }
        .field-error {
          font-size: 0.8125rem;
          color: var(--color-danger);
          font-weight: 500;
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}

