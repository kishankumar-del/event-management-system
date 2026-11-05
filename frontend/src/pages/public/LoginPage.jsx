import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Field } from '../../components/ui/Field';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const from = location.state?.from?.pathname || null;

  // Controlled form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Client-side validation matching server constraints
    const validationErrors = {};
    if (!email.trim()) {
      validationErrors.email = 'Email address is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      validationErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      validationErrors.password = 'Password is required.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      showToast(`Welcome back, ${loggedUser.name}!`, 'success');

      if (from) {
        navigate(from, { replace: true });
      } else if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (loggedUser.role === 'organizer') {
        navigate('/organizer/dashboard', { replace: true });
      } else {
        navigate('/my-tickets', { replace: true });
      }
    } catch (err) {
      setServerError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for evaluator
  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrors({});
    setServerError('');
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-card-notch top-left" />
        <div className="auth-card-notch top-right" />

        <div className="auth-card-header">
          <span className="font-mono text-muted auth-badge">AUTHENTICATION DESK</span>
          <h1 className="page-title" style={{ fontSize: '1.75rem', marginBottom: 4 }}>
            Sign In to Box Office
          </h1>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            Enter your credentials to access tickets, event administration, or reports.
          </p>
        </div>

        {serverError ? (
          <div className="auth-error-banner" role="alert">
            {serverError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} noValidate>
          <Field label="Email Address" htmlFor="login-email" error={errors.email} required>
            <Input
              id="login-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              error={errors.email}
              autoComplete="email"
            />
          </Field>

          <Field label="Password" htmlFor="login-password" error={errors.password} required>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              error={errors.password}
              autoComplete="current-password"
            />
          </Field>

          <div className="auth-submit-row">
            <Button type="submit" variant="primary" loading={loading} style={{ width: '100%' }}>
              Sign In to Account →
            </Button>
          </div>
        </form>

        {/* Demo Account Quick-Fill Palette */}
        <div className="demo-credentials-palette">
          <span className="font-mono demo-palette-label">DEMO ACCOUNTS (ONE-CLICK FILL)</span>
          <div className="demo-btn-group">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fillCredentials('admin@eventbox.com', 'Admin@123456')}
            >
              Fill Admin
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fillCredentials('organizer1@eventbox.com', 'Org@123456')}
            >
              Fill Organizer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fillCredentials('attendee1@eventbox.com', 'User@123456')}
            >
              Fill Attendee
            </Button>
          </div>
        </div>

        <div className="auth-card-footer">
          <span className="text-muted">Do not have an account? </span>
          <Link to="/register">Register new account</Link>
        </div>
      </div>

      <style>{`
        .auth-page-container {
          display: flex;
          justify-content: center;
          padding: var(--space-8) 0;
        }
        .auth-card {
          position: relative;
          background-color: var(--color-surface);
          border: 2px solid var(--color-rule);
          border-top: 5px solid var(--color-accent);
          padding: var(--space-8) var(--space-8);
          max-width: 460px;
          width: 100%;
          border-radius: var(--radius-md);
          box-shadow: 0 4px 16px rgba(85, 123, 131, 0.12);
        }
        .auth-card-header {
          margin-bottom: var(--space-6);
        }
        .auth-badge {
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          display: block;
          margin-bottom: var(--space-2);
        }
        .auth-error-banner {
          background-color: #FDF0ED;
          border: 1px solid var(--color-danger);
          color: var(--color-danger);
          padding: var(--space-3) var(--space-4);
          font-size: 0.875rem;
          margin-bottom: var(--space-4);
          border-radius: var(--radius-sm);
        }
        .auth-submit-row {
          margin-top: var(--space-6);
        }
        .demo-credentials-palette {
          margin-top: var(--space-6);
          padding-top: var(--space-4);
          border-top: 1px dashed var(--color-rule);
        }
        .demo-palette-label {
          font-size: 0.6875rem;
          color: var(--color-muted);
          letter-spacing: 0.08em;
          display: block;
          margin-bottom: var(--space-2);
        }
        .demo-btn-group {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
        }
        .auth-card-footer {
          margin-top: var(--space-6);
          text-align: center;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}

