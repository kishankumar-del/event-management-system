import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Field } from '../../components/ui/Field';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

export function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('attendee');

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = {};
    if (!name.trim()) {
      validationErrors.name = 'Full name is required.';
    } else if (name.trim().length > 100) {
      validationErrors.name = 'Name cannot exceed 100 characters.';
    }

    if (!email.trim()) {
      validationErrors.email = 'Email address is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      validationErrors.email = 'Please provide a valid email address.';
    }

    if (!password) {
      validationErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      validationErrors.password = 'Password must be at least 6 characters.';
    }

    if (password !== confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const user = await register({ name, email, password, role });
      showToast(`Account created successfully! Welcome, ${user.name}.`, 'success');

      if (user.role === 'organizer') {
        navigate('/organizer/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please check the form.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-card-header">
          <span className="font-mono text-muted auth-badge">NEW REGISTRATION</span>
          <h1 className="page-title" style={{ fontSize: '1.75rem', marginBottom: 4 }}>
            Create Box Office Account
          </h1>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            Register as an event attendee to book admission stubs, or as an organizer to curate events.
          </p>
        </div>

        {serverError ? (
          <div className="auth-error-banner" role="alert">
            {serverError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} noValidate>
          <Field label="Full Name" htmlFor="reg-name" error={errors.name} required>
            <Input
              id="reg-name"
              placeholder="e.g. Eleanor Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              error={errors.name}
            />
          </Field>

          <Field label="Email Address" htmlFor="reg-email" error={errors.email} required>
            <Input
              id="reg-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              error={errors.email}
              autoComplete="email"
            />
          </Field>

          <Field
            label="Account Role"
            htmlFor="reg-role"
            hint="Organizers can publish events and scan tickets. Attendees book tickets."
            required
          >
            <Select
              id="reg-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
            >
              <option value="attendee">Attendee (Book & Manage Tickets)</option>
              <option value="organizer">Organizer (Create Events & Check In)</option>
            </Select>
          </Field>

          <Field
            label="Password"
            htmlFor="reg-password"
            hint="Minimum 6 characters"
            error={errors.password}
            required
          >
            <Input
              id="reg-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              error={errors.password}
              autoComplete="new-password"
            />
          </Field>

          <Field
            label="Confirm Password"
            htmlFor="reg-confirm-password"
            error={errors.confirmPassword}
            required
          >
            <Input
              id="reg-confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />
          </Field>

          <div className="auth-submit-row">
            <Button type="submit" variant="primary" loading={loading} style={{ width: '100%' }}>
              Register Account →
            </Button>
          </div>
        </form>

        <div className="auth-card-footer">
          <span className="text-muted">Already registered? </span>
          <Link to="/login">Sign in here</Link>
        </div>
      </div>

      <style>{`
        .auth-page-container {
          display: flex;
          justify-content: center;
          padding: var(--space-8) 0;
        }
        .auth-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-rule);
          padding: var(--space-8);
          max-width: 480px;
          width: 100%;
          border-radius: var(--radius-sm);
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
        .auth-card-footer {
          margin-top: var(--space-6);
          text-align: center;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}

