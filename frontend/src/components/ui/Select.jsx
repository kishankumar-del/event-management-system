import React from 'react';

export function Select({
  id,
  name,
  value,
  onChange,
  children,
  required = false,
  disabled = false,
  error,
  className = '',
  ...props
}) {
  return (
    <>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        aria-invalid={!!error}
        className={`form-select ${error ? 'select-error' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      <style>{`
        .form-select {
          width: 100%;
          min-height: var(--touch-target-min);
          padding: 0 var(--space-3);
          background-color: var(--color-surface);
          border: 1px solid var(--color-rule);
          border-radius: var(--radius-sm);
          color: var(--color-ink);
          font-family: var(--font-ui);
          font-size: 0.9375rem;
          cursor: pointer;
          transition: border-color var(--transition-fast);
        }
        .form-select:hover:not(:disabled) {
          border-color: var(--color-muted);
        }
        .form-select:focus-visible {
          border-color: var(--color-accent);
          outline: 2px solid var(--color-accent);
          outline-offset: 1px;
        }
        .form-select.select-error {
          border-color: var(--color-danger);
        }
        .form-select:disabled {
          background-color: var(--color-paper);
          color: var(--color-muted);
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}

