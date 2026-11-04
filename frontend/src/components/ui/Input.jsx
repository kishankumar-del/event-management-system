import React from 'react';

export function Input({
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  className = '',
  ...props
}) {
  return (
    <>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-invalid={!!error}
        className={`form-input ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      <style>{`
        .form-input {
          width: 100%;
          min-height: var(--touch-target-min);
          padding: 0 var(--space-3);
          background-color: var(--color-surface);
          border: 1px solid var(--color-rule);
          border-radius: var(--radius-sm);
          color: var(--color-ink);
          font-family: var(--font-ui);
          font-size: 0.9375rem;
          transition: border-color var(--transition-fast);
        }
        .form-input::placeholder {
          color: var(--color-muted);
          opacity: 0.7;
        }
        .form-input:hover:not(:disabled) {
          border-color: var(--color-muted);
        }
        .form-input:focus-visible {
          border-color: var(--color-accent);
          outline: 2px solid var(--color-accent);
          outline-offset: 1px;
        }
        .form-input.input-error {
          border-color: var(--color-danger);
        }
        .form-input:disabled {
          background-color: var(--color-paper);
          color: var(--color-muted);
          cursor: not-allowed;
          opacity: 0.7;
        }
      `}</style>
    </>
  );
}

