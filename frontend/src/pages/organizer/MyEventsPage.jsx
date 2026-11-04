import React from 'react';
import { Link } from 'react-router-dom';
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

export function MyEventsPage() {
  const { showToast } = useToast();
  const {
    data: events,
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
  } = usePaginatedList('/events', { limit: 10 });

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      await api.patch(`/events/${eventId}`, { status: newStatus });
      showToast(`Event status updated to ${newStatus}.`, 'success');
      refetch();
    } catch (err) {
      showToast(err.message || 'Failed to update event status.', 'error');
    }
  };

  return (
    <div className="my-events-management-page">
      <div className="page-header-strip">
        <div>
          <span className="font-mono text-muted page-badge">PROGRAMME MANAGEMENT</span>
          <h1 className="page-title">My Managed Events</h1>
          <p className="text-muted" style={{ fontSize: '0.9375rem' }}>
            Author, edit, schedule, and moderate your productions and capacity allocations.
          </p>
        </div>

        <Link to="/organizer/events/new">
          <Button variant="primary">+ Create New Event</Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="table-filter-bar">
        <div style={{ flex: 1, minWidth: 240 }}>
          <Input
            placeholder="Search by event title or keyword..."
            value={searchInput}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ minWidth: 160 }}>
          <Select
            value={filters.status || ''}
            onChange={(e) => setFilter('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </Select>
        </div>
      </div>

      {loading ? (
        <Spinner message="Loading events roster..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : events.length === 0 ? (
        <EmptyState
          title="No events found"
          message="You have no events matching this query. Create your first production."
          actionLabel="Create Event"
          onAction={() => window.location.assign('/organizer/events/new')}
        />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Venue</th>
                <th>Start Date</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => {
                const startDate = new Date(ev.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <tr key={ev._id}>
                    <td data-label="Title" style={{ fontWeight: 600 }}>
                      <Link to={`/events/${ev._id}`}>{ev.title}</Link>
                    </td>
                    <td data-label="Category" className="font-mono" style={{ fontSize: '0.8125rem' }}>
                      {ev.category}
                    </td>
                    <td data-label="Venue">
                      {ev.venue?.name}, {ev.venue?.city}
                    </td>
                    <td data-label="Start Date" className="tabular-nums font-mono">
                      {startDate}
                    </td>
                    <td data-label="Capacity" className="tabular-nums font-mono">
                      {ev.capacity}
                    </td>
                    <td data-label="Status">
                      <Badge status={ev.status} />
                    </td>
                    <td data-label="Actions">
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <Link to={`/organizer/events/${ev._id}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        {ev.status === 'draft' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStatusChange(ev._id, 'published')}
                          >
                            Publish
                          </Button>
                        ) : null}
                        {ev.status === 'published' ? (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleStatusChange(ev._id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
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
        .my-events-management-page {
          max-width: var(--container-max);
          margin: 0 auto;
        }
        .page-header-strip {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: var(--space-4);
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
        .table-filter-bar {
          display: flex;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
}

