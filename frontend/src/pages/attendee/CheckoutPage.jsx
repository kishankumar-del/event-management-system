import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { Stub } from '../../components/ui/Stub';

export function CheckoutPage() {
  const { id: eventId } = useParams();
  const [searchParams] = useSearchParams();
  const preselectedTierId = searchParams.get('tier');

  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [ticketTypeId, setTicketTypeId] = useState(preselectedTierId || '');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    async function loadEvent() {
      try {
        const res = await api.get(`/events/${eventId}`);
        setEvent(res.data);
        if (!preselectedTierId && res.data.ticketTypes?.length > 0) {
          setTicketTypeId(res.data.ticketTypes[0]._id);
        }
      } catch (err) {
        setError(err.message || 'Failed to load event for checkout.');
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [eventId, preselectedTierId]);

  if (loading) {
    return <Spinner message="Preparing checkout desk..." />;
  }

  if (error || !event) {
    return <ErrorState message={error || 'Event not found'} />;
  }

  const selectedTier = event.ticketTypes?.find((t) => t._id === ticketTypeId);
  const unitPrice = selectedTier?.price || 0;
  const totalPrice = unitPrice * quantity;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showToast('Please sign in to complete your ticket registration.', 'warning');
      navigate('/login', { state: { from: { pathname: `/events/${eventId}/register` } } });
      return;
    }

    if (!ticketTypeId) {
      showToast('Please select a ticket tier.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/registrations', {
        eventId,
        ticketTypeId,
        quantity: Number(quantity),
        paymentMethod,
      });

      setSuccessData(res.data);
      showToast('Tickets confirmed! Your admission stub has been issued.', 'success');
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Success view rendering the newly minted Ticket Stub
  if (successData) {
    const reg = successData.registration;
    const pay = successData.payment;

    return (
      <div className="checkout-success-container">
        <div className="success-banner">
          <span className="font-mono success-eyebrow">TRANSACTION CONFIRMED • RECEIPT #{pay?.reference}</span>
          <h1 className="page-title" style={{ fontSize: '1.75rem', marginBottom: 4 }}>
            Admission Stub Issued
          </h1>
          <p className="text-muted" style={{ fontSize: '0.9375rem', maxWidth: 540 }}>
            Your registration is confirmed and tickets have been subtracted from live allocation. Present this ticket stub at the venue box office desk.
          </p>
        </div>

        {/* Render signature Stub */}
        <div className="issued-stub-wrapper">
          <Stub
            registrationCode={reg.registrationCode}
            eventTitle={event.title}
            venueName={event.venue?.name}
            venueCity={event.venue?.city}
            eventDate={event.startDate}
            ticketTier={reg.ticketType?.name || selectedTier?.name}
            quantity={reg.quantity}
            price={reg.ticketType?.price || unitPrice}
            attendeeName={user?.name || 'Ticket Holder'}
            status="confirmed"
            attendance="pending"
            actions={
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                Print Stub
              </Button>
            }
          />
        </div>

        <div className="success-actions-row">
          <Link to="/my-tickets">
            <Button variant="primary">Go to My Tickets Collection →</Button>
          </Link>
          <Link to="/">
            <Button variant="ghost">Browse More Events</Button>
          </Link>
        </div>

        <style>{`
          .checkout-success-container {
            max-width: 800px;
            margin: 0 auto;
            padding: var(--space-6) 0;
          }
          .success-banner {
            margin-bottom: var(--space-6);
            border-bottom: var(--border-hairline);
            padding-bottom: var(--space-4);
          }
          .success-eyebrow {
            font-size: 0.75rem;
            color: var(--color-success);
            font-weight: 700;
            display: block;
            margin-bottom: var(--space-2);
          }
          .issued-stub-wrapper {
            margin: var(--space-6) 0;
          }
          .success-actions-row {
            display: flex;
            gap: var(--space-3);
            margin-top: var(--space-6);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="checkout-page-container">
      <div className="checkout-header">
        <Link to={`/events/${eventId}`} className="breadcrumb-link">
          ← Back to Event Details
        </Link>
        <h1 className="page-title" style={{ marginTop: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
          Checkout & Admission Order
        </h1>
        <p className="text-muted font-mono" style={{ fontSize: '0.875rem' }}>
          EVENT: {event.title}
        </p>
      </div>

      <div className="checkout-layout-grid">
        {/* Order Form */}
        <div className="checkout-form-col">
          <form onSubmit={handleSubmit} className="checkout-card">
            <h2 className="section-title" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-4)' }}>
              1. Admission Selection
            </h2>

            <Field label="Ticket Tier" htmlFor="tier-select" required>
              <Select
                id="tier-select"
                value={ticketTypeId}
                onChange={(e) => setTicketTypeId(e.target.value)}
                disabled={submitting}
              >
                {event.ticketTypes?.map((tier) => {
                  const remaining = Math.max(0, tier.quantityTotal - tier.quantitySold);
                  return (
                    <option key={tier._id} value={tier._id} disabled={remaining <= 0}>
                      {tier.name} — ₹{tier.price.toFixed(2)} ({remaining} available)
                    </option>
                  );
                })}
              </Select>
            </Field>

            <Field label="Ticket Quantity" htmlFor="qty-select" hint="Maximum 10 tickets per order" required>
              <Select
                id="qty-select"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                disabled={submitting}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'Ticket' : 'Tickets'}
                  </option>
                ))}
              </Select>
            </Field>

            <hr style={{ margin: 'var(--space-5) 0' }} />

            <h2 className="section-title" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-4)' }}>
              2. Payment Method (Simulated Gateway)
            </h2>

            <Field label="Payment Gateway Method" htmlFor="payment-method-select" hint="Simulated transaction record; no real charge will occur." required>
              <Select
                id="payment-method-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={submitting}
              >
                <option value="card">Credit / Debit Card (Simulated)</option>
                <option value="upi">UPI / Instant Transfer (Simulated)</option>
                <option value="cash">Cash on Admission Desk</option>
              </Select>
            </Field>

            <div style={{ marginTop: 'var(--space-6)' }}>
              <Button type="submit" variant="primary" loading={submitting} style={{ width: '100%' }}>
                Confirm Registration & Issue Stub (₹{totalPrice.toFixed(2)}) →
              </Button>
            </div>
          </form>
        </div>

        {/* Order Summary Receipt Box */}
        <div className="checkout-summary-col">
          <div className="summary-card">
            <span className="font-mono summary-badge">ORDER SUMMARY</span>
            <h3 className="summary-event-name">{event.title}</h3>
            <p className="summary-venue text-muted">
              {event.venue?.name}, {event.venue?.city}
            </p>

            <div className="summary-breakdown">
              <div className="summary-line">
                <span>Tier</span>
                <span className="font-mono">{selectedTier?.name || 'Selected Tier'}</span>
              </div>
              <div className="summary-line">
                <span>Unit Price</span>
                <span className="font-mono tabular-nums">₹{unitPrice.toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span>Quantity</span>
                <span className="font-mono tabular-nums">{quantity}</span>
              </div>
              <hr style={{ margin: 'var(--space-3) 0' }} />
              <div className="summary-line total-line">
                <span style={{ fontWeight: 700 }}>Total Due</span>
                <span className="font-mono tabular-nums total-amount">₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <p className="summary-footnote text-muted">
              Atomic inventory reservations are held until confirmation. Cancellation policy restores tickets to inventory.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .checkout-page-container {
          max-width: 900px;
          margin: 0 auto;
        }
        .checkout-header {
          margin-bottom: var(--space-6);
          border-bottom: var(--border-hairline);
          padding-bottom: var(--space-4);
        }
        .breadcrumb-link {
          font-size: 0.8125rem;
          color: var(--color-muted);
          text-decoration: none;
        }
        .checkout-layout-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: var(--space-6);
        }
        .checkout-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-rule);
          padding: var(--space-6);
          border-radius: var(--radius-sm);
        }
        .summary-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-rule);
          padding: var(--space-6);
          position: sticky;
          top: 88px;
        }
        .summary-badge {
          font-size: 0.6875rem;
          color: var(--color-muted);
          letter-spacing: 0.1em;
          display: block;
          margin-bottom: var(--space-2);
        }
        .summary-event-name {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          line-height: 1.25;
          margin-bottom: 4px;
        }
        .summary-venue {
          font-size: 0.8125rem;
          margin-bottom: var(--space-4);
        }
        .summary-breakdown {
          font-size: 0.875rem;
        }
        .summary-line {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
        }
        .total-line {
          font-size: 1.0625rem;
        }
        .total-amount {
          color: var(--color-accent);
          font-weight: 700;
        }
        .summary-footnote {
          font-size: 0.75rem;
          line-height: 1.4;
          margin-top: var(--space-4);
        }
        @media (max-width: 768px) {
          .checkout-layout-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

