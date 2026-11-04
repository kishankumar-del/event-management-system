import React, { useState } from 'react';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Pagination } from '../../components/ui/Pagination';
import { Stub } from '../../components/ui/Stub';

export function RegistrationsPage() {
  const { showToast } = useToast();
  const {
    data: registrations,
    loading,
    error,
    page,
    totalPages,
    total,
    limit,
    searchInput,
    filters,
    setPage,
    setSearch,
    setFilter,
    refetch,
  } = usePaginatedList('/registrations', { limit: 10 });

  const [activeStub, setActiveStub] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const handleCheckInToggle = async (regId, currentAttendance) => {
    const nextAttendance = currentAttendance === 'checked_in' ? 'pending' : 'checked_in';
    setUpdatingId(regId);

    try {
      await api.patch(`/registrations/${regId}/check-in`, {
        attendance: nextAttendance,
      });
      showToast(`Attendance marked as '${nextAttendance}'.`, 'success');
      refetch();
    } catch (err) {
      showToast(err.message || 'Check-in update failed.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="registrations-management-page">
      <div className="page-header-strip">
        <div>
          <span className="font-mono text-muted page-badge">GATE ROSTER</span>
          <h1 className="page-title">Door Check-In & Admissions Audit</h1>
          <p className="text-muted" style={{ fontSize: '0.9375rem' }}>
            Verify attendee registration codes, inspect ticket stubs, and toggle door check-ins in real time.
          </p>
        </div>
      </div>

      {/* Filter and Code Search Bar */}
      <div className="search-filter-row">
        <div style={{ flex: 1, minWidth: 260 }}>
          <Input
            placeholder="Search code (e.g. REG-8K9A2M) or attendee name..."
            value={searchInput}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ minWidth: 170 }}>
          <Select
            value={filters.attendance || ''}
            onChange={(e) => setFilter('attendance', e.target.value)}
          >
            <option value="">All Attendance</option>
            <option value="pending">Pending Door Check-in</option>
            <option value="checked_in">Checked In</option>
            <option value="no_show">No Show</option>
          </Select>
        </div>

        <div style={{ minWidth: 160 }}>
          <Select
            value={filters.status || ''}
            onChange={(e) => setFilter('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </div>

      {/* Stub Modal Preview if selected */}
      {activeStub && (
        <div className="stub-modal-overlay" onClick={() => setActiveStub(null)}>
          <div className="stub-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="font-mono text-muted" style={{ fontSize: '0.75rem' }}>
                VERIFIED ADMISSION STUB INSPECTION
              </span>
              <button
                type="button"
                onClick={() => setActiveStub(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                ✕
              </button>
            </div>
            <Stub
              registrationCode={activeStub.registrationCode}
              eventTitle={activeStub.event?.title}
              venueName={activeStub.event?.venue?.name}
              venueCity={activeStub.event?.venue?.city}
              eventDate={activeStub.event?.startDate}
              ticketTier={activeStub.ticketType?.name}
              quantity={activeStub.quantity}
              price={activeStub.ticketType?.price}
              attendeeName={activeStub.user?.name}
              status={activeStub.status}
              attendance={activeStub.attendance}
              actions={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleCheckInToggle(activeStub._id, activeStub.attendance)}
                  loading={updatingId === activeStub._id}
                >
                  {activeStub.attendance === 'checked_in' ? 'Undo Check-In' : 'Door Check-In'}
                </Button>
              }
            />
          </div>
        </div>
      )}

      {loading ? (
        <Spinner message="Retrieving gate admission roster..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : registrations.length === 0 ? (
        <EmptyState
          title="No registrations found"
          message="No bookings match your current filter parameters or search code."
        />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Attendee</th>
                <th>Event & Tier</th>
                <th>Qty</th>
                <th>Order Status</th>
                <th>Gate Attendance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg._id}>
                  <td data-label="Code">
                    <span
                      className="font-mono stub-code-pill"
                      onClick={() => setActiveStub(reg)}
                      title="Click to view Admission Stub"
                    >
                      {reg.registrationCode}
                    </span>
                  </td>
                  <td data-label="Attendee">
                    <div style={{ fontWeight: 600 }}>{reg.user?.name}</div>
                    <div className="font-mono text-muted" style={{ fontSize: '0.75rem' }}>
                      {reg.user?.email}
                    </div>
                  </td>
                  <td data-label="Event & Tier">
                    <div>{reg.event?.title}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {reg.ticketType?.name}
                    </div>
                  </td>
                  <td data-label="Qty" className="tabular-nums font-mono">
                    {reg.quantity}
                  </td>
                  <td data-label="Order Status">
                    <Badge status={reg.status} />
                  </td>
                  <td data-label="Gate Attendance">
                    <Badge status={reg.attendance} />
                  </td>
                  <td data-label="Actions">
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Button
                        variant={reg.attendance === 'checked_in' ? 'outline' : 'primary'}
                        size="sm"
                        disabled={reg.status === 'cancelled'}
                        loading={updatingId === reg._id}
                        onClick={() => handleCheckInToggle(reg._id, reg.attendance)}
                      >
                        {reg.attendance === 'checked_in' ? 'Mark Pending' : 'Check In'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveStub(reg)}
                      >
                        Stub
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={setPage}
          />
        </>
      )}

      <style>{`
        .registrations-management-page {
          max-width: var(--container-max);
          margin: 0 auto;
        }
        .page-header-strip {
          margin-bottom: var(--space-6);
          border-bottom: var(--border-hairline);
          padding-bottom: var(--space-4);
        }
        .page-badge {
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          display: block;
          margin-bottom: var(--space-2);
        }
        .search-filter-row {
          display: flex;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
          flex-wrap: wrap;
        }
        .stub-code-pill {
          background-color: var(--color-paper);
          border: 1px solid var(--color-rule);
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          font-weight: 700;
          color: var(--color-accent);
          cursor: pointer;
        }
        .stub-code-pill:hover {
          border-color: var(--color-accent);
        }
        .stub-modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(23, 20, 15, 0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--space-4);
        }
        .stub-modal-content {
          background-color: var(--color-paper);
          padding: var(--space-6);
          border: 1px solid var(--color-ink);
          max-width: 780px;
          width: 100%;
        }
      `}</style>
    </div>
  );
}

