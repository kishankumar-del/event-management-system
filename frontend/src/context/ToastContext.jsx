import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', durationMs = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const toast = { id, message, type };

    setToasts((prev) => [...prev, toast]);

    if (durationMs > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, durationMs);
    }
  }, [dismissToast]);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast, toasts }}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`} role="alert">
            <span className="toast-message">{toast.message}</span>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <style>{`
        .toast-container {
          position: fixed;
          bottom: var(--space-6);
          right: var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          z-index: 9999;
          max-width: 380px;
          pointer-events: none;
        }
        .toast {
          pointer-events: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          background-color: var(--color-surface);
          border: 1px solid var(--color-rule);
          border-left: 4px solid var(--color-ink);
          color: var(--color-ink);
          font-family: var(--font-ui);
          font-size: 0.875rem;
          box-shadow: 0 4px 12px rgba(23, 20, 15, 0.08);
          animation: toastSlideIn 180ms ease;
        }
        .toast-success { border-left-color: var(--color-success); }
        .toast-error { border-left-color: var(--color-danger); }
        .toast-warning { border-left-color: var(--color-pending); }
        .toast-info { border-left-color: var(--color-accent); }
        .toast-message { flex: 1; margin-right: var(--space-2); }
        .toast-close-btn {
          background: none;
          border: none;
          font-size: 1.25rem;
          line-height: 1;
          color: var(--color-muted);
          padding: 0 var(--space-1);
        }
        .toast-close-btn:hover { color: var(--color-ink); }
        @keyframes toastSlideIn {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

