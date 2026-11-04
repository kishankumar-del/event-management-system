import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Stub } from '../../components/ui/Stub';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Pagination } from '../../components/ui/Pagination';

export function MyTicketsPage() {
  const { showToast } = useToast();
  const {
    data: registrations,
    loading,
    error,
    page,
    totalPages,
    total,
    limit,
    setPage,
    refetch,
  } = usePaginatedList('/registrations', { limit: 5 });

  const [cancellingId, setCancellingId] = useState(null);

  const handleCancel = async (regId) => {
    if (!window.confirm('Are you sure you want to cancel this registration? Your tickets will be returned to live allocation.')) {
      return;
    }

    setCancellingId(regId);
    try {
      await api.patch(`/registrations/${regId}/cancel`);
      showToast('Registration cancelled. Ticket inventory has been restored.', 'success');
      refetch();
    } catch (err) {
      showToast(err.message || 'Failed to cancel registration.', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="my-tickets-page">
      <div className="page-header-strip">
        <div>
          <span className="font-mono text-muted page-badge">ATTENDEE VAULT</span>
          <h1 className="page-title">My Admission Tickets & Stubs</h1>
          <p className="text-muted" style={{ fontSize: '0.9375rem' }}>
            All active bookings, admission verification codes, and attendance stubs in your personal archive.
          </p>
        </div>
        <Link to="/">
          <Button variant="outline" size="sm">
            Browse More Events →
          </Button>
        </Link>
      </div>

      {loading ? (
        <Spinner message="Retrieving your ticket stubs..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : registrations.length === 0 ? (
        <EmptyState
          title="No tickets in your collection"
          message="You have not booked any admission stubs yet. Explore our published programme catalogue."
          actionLabel="Browse Events"
          onAction={() => window.location.assign('/')}
        />
      ) : (
        <div className="stubs-collection">
          {registrations.map((reg) => (
            <Stub
              key={reg._id}
              registrationCode={reg.registrationCode}
              eventTitle={reg.event?.title || 'Unknown Event'}
              venueName={reg.event?.venue?.name || 'Venue'}
              venueCity={reg.event?.venue?.city || 'City'}
              eventDate={reg.event?.startDate}
              ticketTier={reg.ticketType?.name || 'General'}
              quantity={reg.quantity}
              price={reg.ticketType?.price || 0}
              attendeeName={reg.user?.name || 'Attendee'}
              status={reg.status}
              attendance={reg.attendance}
              actions={
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                    style={{ width: '100%' }}
                  >
                    Print
                  </Button>
                  {reg.status === 'confirmed' ? (
                    <Button
                      variant="danger"
                      size="sm"
                      loading={cancellingId === reg._id}
                      onClick={() => handleCancel(reg._id)}
                      style={{ width: '100%' }}
                    >
                      Cancel
                    </Button>
                  ) : null}
                </div>
              }
            />
          ))}

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={setPage}
          />
        </div>
      )}

      <style>{`
        .my-tickets-page {
          max-width: 900px;
          margin: 0 auto;
        }
        .page-header-strip {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: var(--space-4);
          margin-bottom: var(--space-8);
          border-bottom: var(--border-hairline);
          padding-bottom: var(--space-6);
        }
        .page-badge {
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          display: block;
          margin-bottom: var(--space-2);
        }
        .stubs-collection {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }
      `}</style>
    </div>
  );
}

