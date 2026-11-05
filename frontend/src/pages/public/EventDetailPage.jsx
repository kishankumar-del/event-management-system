import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';

export function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  if (loading) {
    return <Spinner message="Loading admission details..." />;
  }

  if (error || !event) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 0' }}>
        <ErrorState
          title="Event Not Found"
          message={error || 'The requested event could not be retrieved from the box office.'}
          onRetry={fetchEvent}
        />
        <Link to="/" style={{ display: 'inline-block', marginTop: '16px' }}>
          ← Return to Browse Events
        </Link>
      </div>
    );
  }

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const dateFormatted = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const timeFormatted = `${startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

  const now = new Date();

  return (
    <div className="event-detail-page">
      <div className="breadcrumb-nav">
        <Link to="/" className="breadcrumb-link">
          ← Back to All Events
        </Link>
      </div>

      <header className="event-hero">
        <div className="hero-meta-strip">
          <Badge label={event.category} />
          <Badge status={event.status} />
          <span className="font-mono text-muted">ORGANIZED BY: {event.organizer?.name}</span>
        </div>

        <h1 className="page-title event-headline">{event.title}</h1>

        <div className="hero-info-grid">
          <div className="info-box">
            <span className="font-mono info-label">VENUE LOCATION</span>
            <span className="info-value">{event.venue?.name}</span>
            <span className="info-sub text-muted">
              {event.venue?.address}, {event.venue?.city}
            </span>
          </div>

          <div className="info-box">
            <span className="font-mono info-label">DATE & SCHEDULE</span>
            <span className="info-value tabular-nums">{dateFormatted}</span>
            <span className="info-sub font-mono text-muted">{timeFormatted}</span>
          </div>

          <div className="info-box">
            <span className="font-mono info-label">VENUE CAPACITY</span>
            <span className="info-value tabular-nums">{event.capacity} Persons</span>
            <span className="info-sub text-muted">Max Venue Limit: {event.venue?.capacity}</span>
          </div>
        </div>
      </header>

      {/* Description Section */}
      <section className="event-section">
        <h2 className="section-title">Programme Overview</h2>
        <div className="event-description-text">
          <p>{event.description}</p>
        </div>
      </section>

      {/* Ticket Tiers Section */}
      <section className="event-section" style={{ marginTop: 'var(--space-8)' }}>
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Available Ticket Tiers</h2>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>
              Select a tier to register your admission stubs. Quantities update atomically in real time.
            </p>
          </div>
          {event.status === 'published' ? (
            <Link to={`/events/${event._id}/register`}>
              <Button variant="primary">Proceed to Checkout →</Button>
            </Link>
          ) : (
            <Badge status={event.status} label={`Sales Unavailable (${event.status})`} />
          )}
        </div>

        {event.ticketTypes && event.ticketTypes.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th>Tier Name</th>
                <th>Price</th>
                <th>Availability</th>
                <th>Sale Window</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {event.ticketTypes.map((tier) => {
                const saleStart = new Date(tier.saleStart);
                const saleEnd = new Date(tier.saleEnd);
                const isSaleOpen = now >= saleStart && now <= saleEnd;
                const isSoldOut = tier.quantitySold >= tier.quantityTotal;
                const remaining = Math.max(0, tier.quantityTotal - tier.quantitySold);

                return (
                  <tr key={tier._id}>
                    <td data-label="Tier Name" style={{ fontWeight: 600 }}>
                      {tier.name}
                    </td>
                    <td data-label="Price" className="tabular-nums font-mono" style={{ fontWeight: 600 }}>
                      {tier.price === 0 ? 'FREE' : `₹${tier.price.toFixed(2)}`}
                    </td>
                    <td data-label="Availability" className="tabular-nums font-mono">
                      {remaining} of {tier.quantityTotal} left
                    </td>
                    <td data-label="Sale Window" className="font-mono text-muted" style={{ fontSize: '0.8125rem' }}>
                      {saleStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
                      {saleEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td data-label="Status">
                      {isSoldOut ? (
                        <Badge status="danger" label="Sold Out" />
                      ) : !isSaleOpen ? (
                        <Badge status="pending" label={now < saleStart ? 'Upcoming' : 'Closed'} />
                      ) : (
                        <Badge status="success" label="On Sale" />
                      )}
                    </td>
                    <td data-label="Action">
                      {event.status === 'published' && isSaleOpen && !isSoldOut ? (
                        <Link to={`/events/${event._id}/register?tier=${tier._id}`}>
                          <Button variant="outline" size="sm">
                            Select
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.8125rem' }}>
                          Unavailable
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <div className="no-tiers-box text-muted">
            No ticket tiers have been published for this event yet.
          </div>
        )}
      </section>

      <style>{`
        .event-detail-page {
          max-width: 960px;
          margin: 0 auto;
        }
        .breadcrumb-nav {
          margin-bottom: var(--space-4);
        }
        .breadcrumb-link {
          font-size: 0.8125rem;
          color: var(--color-muted);
          text-decoration: none;
        }
        .breadcrumb-link:hover {
          color: var(--color-ink);
        }
        .event-hero {
          border-bottom: var(--border-hairline);
          padding-bottom: var(--space-6);
          margin-bottom: var(--space-6);
        }
        .hero-meta-strip {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-3);
          flex-wrap: wrap;
        }
        .event-headline {
          font-size: 2.25rem;
          line-height: 1.2;
          margin-bottom: var(--space-6);
        }
        .hero-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: var(--space-4);
        }
        .info-box {
          background-color: var(--color-surface);
          border: 1px solid var(--color-rule);
          border-radius: var(--radius-md);
          box-shadow: 0 1px 4px rgba(85, 123, 131, 0.08);
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
        }
        .info-label {
          font-size: 0.6875rem;
          color: var(--color-muted);
          letter-spacing: 0.08em;
          margin-bottom: var(--space-1);
        }
        .info-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-ink);
        }
        .info-sub {
          font-size: 0.8125rem;
          margin-top: 4px;
        }
        .event-description-text {
          font-size: 1rem;
          line-height: 1.7;
          color: var(--color-ink);
          max-width: 720px;
        }
        .section-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: var(--space-4);
          margin-bottom: var(--space-4);
        }
        .no-tiers-box {
          background-color: var(--color-surface);
          border: 1px dashed var(--color-rule);
          padding: var(--space-6);
          text-align: center;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

