import React from 'react';
import { Link } from 'react-router-dom';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Pagination } from '../../components/ui/Pagination';
import { Stub } from '../../components/ui/Stub';

const CATEGORIES = [
  'All Categories',
  'Concert',
  'Conference',
  'Workshop',
  'Seminar',
  'Meetup',
  'Exhibition',
];

export function HomePage() {
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
    sort,
    setPage,
    setSearch,
    setFilter,
    setSort,
    refetch,
  } = usePaginatedList('/events', { limit: 6, sort: 'startDate' });

  return (
    <div className="catalogue-page">
      {/* Editorial Page Header */}
      <div className="catalogue-header">
        <div className="header-meta">
          <span className="font-mono text-muted issue-tag">DESK PROGRAMME • 2026/2027</span>
        </div>
        <h1 className="page-title">Current Events & Box Office Admissions</h1>
        <p className="catalogue-sub text-muted">
          Browse published symphony concerts, engineering summits, and intimate workshops with live ticket availability.
        </p>
      </div>

      {/* Signature Stub Preview Section */}
      <section className="stub-feature-strip" aria-labelledby="stub-feature-title">
        <div className="stub-feature-meta">
          <span className="font-mono text-muted">ADMISSION SAMPLE TICKET STUB</span>
          <p className="text-muted" style={{ fontSize: '0.8125rem', marginTop: 4 }}>
            Every confirmed registration renders an archival notched ticket with small-caps verification code.
          </p>
        </div>
        <Stub
          registrationCode="REG-8K9A2M"
          eventTitle="Midwest Chamber Symphonia: Bach & Glass"
          venueName="The Grand Opera House"
          venueCity="New York"
          eventDate={new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)}
          ticketTier="VIP Balcony Tier"
          quantity={2}
          price={1499}
          attendeeName="Eleanor Vance"
          status="confirmed"
          attendance="checked_in"
        />
      </section>

      {/* Filter and Search Bar */}
      <div className="catalogue-toolbar">
        <div className="search-field">
          <Input
            id="event-search"
            placeholder="Search by event title, keyword, or venue..."
            value={searchInput}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search events"
          />
        </div>

        <div className="filter-group">
          <div className="filter-select-wrapper">
            <Select
              id="category-select"
              value={filters.category || ''}
              onChange={(e) => setFilter('category', e.target.value)}
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              {CATEGORIES.slice(1).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </div>

          <div className="filter-select-wrapper">
            <Select
              id="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort events"
            >
              <option value="startDate">Date: Soonest First</option>
              <option value="-startDate">Date: Furthest First</option>
              <option value="title">Title: A to Z</option>
              <option value="-createdAt">Recently Added</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Catalogue State Handlers */}
      {loading ? (
        <Spinner message="Fetching box office admissions..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : events.length === 0 ? (
        <EmptyState
          title="No events match your criteria"
          message="Try adjusting your keyword query, category filter, or check back soon for newly published programmes."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setFilter('category', '');
          }}
        />
      ) : (
        <div className="events-roster">
          {events.map((event) => {
            const startDate = new Date(event.startDate);
            const dateStr = startDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
            const timeStr = startDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <article key={event._id} className="event-row">
                <div className="event-row-date">
                  <span className="date-badge-month font-mono text-muted">
                    {startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                  </span>
                  <span className="date-badge-day tabular-nums font-mono">
                    {startDate.getDate()}
                  </span>
                </div>

                <div className="event-row-main">
                  <div className="event-meta-line">
                    <Badge label={event.category} />
                    <span className="dot-divider">•</span>
                    <span className="event-venue-text">
                      {event.venue?.name}, {event.venue?.city}
                    </span>
                    <span className="dot-divider">•</span>
                    <span className="event-time-text font-mono text-muted">
                      {dateStr} at {timeStr}
                    </span>
                  </div>

                  <h2 className="event-row-title">
                    <Link to={`/events/${event._id}`} className="event-title-link">
                      {event.title}
                    </Link>
                  </h2>

                  <p className="event-row-desc text-muted">{event.description}</p>
                </div>

                <div className="event-row-action">
                  <div className="event-capacity font-mono text-muted">
                    CAPACITY: <span className="tabular-nums">{event.capacity}</span>
                  </div>
                  <Link to={`/events/${event._id}`}>
                    <Button variant="primary" size="sm">
                      View Tickets →
                    </Button>
                  </Link>
                </div>
              </article>
            );
          })}

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
        .catalogue-page {
          max-width: var(--container-max);
          margin: 0 auto;
        }
        .catalogue-header {
          margin-bottom: var(--space-8);
          border-bottom: var(--border-hairline);
          padding-bottom: var(--space-6);
        }
        .header-meta {
          margin-bottom: var(--space-2);
        }
        .issue-tag {
          font-size: 0.75rem;
          letter-spacing: 0.1em;
        }
        .catalogue-sub {
          font-size: 1.0625rem;
          max-width: 640px;
          line-height: 1.5;
        }

        /* Stub feature strip */
        .stub-feature-strip {
          margin-bottom: var(--space-8);
          padding: var(--space-6);
          background-color: rgba(255, 255, 255, 0.7);
          border: 1px solid var(--color-rule);
          border-radius: var(--radius-md);
          box-shadow: 0 2px 8px rgba(85, 123, 131, 0.08);
        }
        .stub-feature-meta {
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          margin-bottom: var(--space-4);
        }

        /* Toolbar */
        .catalogue-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
          background-color: var(--color-surface);
          border: 2px solid var(--color-rule);
          padding: var(--space-4);
          border-radius: var(--radius-md);
          box-shadow: 0 2px 8px rgba(85, 123, 131, 0.08);
        }
        .search-field {
          flex: 1;
          min-width: 260px;
        }
        .filter-group {
          display: flex;
          gap: var(--space-3);
          flex-wrap: wrap;
        }
        .filter-select-wrapper {
          min-width: 170px;
        }

        /* Flat Roster Rows */
        .events-roster {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .event-row {
          display: flex;
          align-items: flex-start;
          gap: var(--space-6);
          padding: var(--space-5) var(--space-6);
          background-color: var(--color-surface);
          border: 1px solid var(--color-rule);
          border-radius: var(--radius-md);
          box-shadow: 0 1px 4px rgba(85, 123, 131, 0.06);
          transition: all var(--transition-fast);
        }
        .event-row:hover {
          background-color: var(--color-surface-hover);
          border-color: var(--color-accent);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(85, 123, 131, 0.12);
        }
        .event-row-date {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 68px;
          padding: var(--space-2);
          background-color: var(--color-surface-mint);
          border: 1px solid var(--color-border-dark);
          border-radius: var(--radius-sm);
          flex-shrink: 0;
          text-align: center;
        }
        .date-badge-month {
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--color-border-dark);
        }
        .date-badge-day {
          font-size: 1.5rem;
          font-weight: 800;
          line-height: 1.1;
          color: var(--color-ink);
        }
        .event-row-main {
          flex: 1;
          min-width: 0;
        }
        .event-meta-line {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.8125rem;
          margin-bottom: var(--space-2);
          flex-wrap: wrap;
        }
        .dot-divider {
          color: var(--color-muted);
        }
        .event-venue-text {
          font-weight: 500;
          color: var(--color-ink);
        }
        .event-row-title {
          font-family: var(--font-heading);
          font-size: 1.35rem;
          line-height: 1.25;
          margin-bottom: var(--space-2);
        }
        .event-title-link {
          color: var(--color-ink);
          text-decoration: none;
        }
        .event-title-link:hover {
          color: var(--color-accent);
        }
        .event-row-desc {
          font-size: 0.875rem;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .event-row-action {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: var(--space-3);
          flex-shrink: 0;
        }
        .event-capacity {
          font-size: 0.75rem;
        }

        /* Mobile Layout */
        @media (max-width: 720px) {
          .event-row {
            flex-direction: column;
            gap: var(--space-3);
          }
          .event-row-action {
            width: 100%;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            border-top: 1px dashed var(--color-rule);
            padding-top: var(--space-3);
          }
        }
      `}</style>
    </div>
  );
}

