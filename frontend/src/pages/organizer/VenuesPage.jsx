import React, { useState } from 'react';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Pagination } from '../../components/ui/Pagination';

export function VenuesPage() {
  const { showToast } = useToast();
  const {
    data: venues,
    loading,
    error,
    page,
    totalPages,
    total,
    limit,
    searchInput,
    setPage,
    setSearch,
    refetch,
  } = usePaginatedList('/venues', { limit: 10 });

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [capacity, setCapacity] = useState('');

  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleCreateVenue = async (e) => {
    e.preventDefault();

    const errs = {};
    if (!name.trim()) errs.name = 'Venue name is required.';
    if (!address.trim()) errs.address = 'Street address is required.';
    if (!city.trim()) errs.city = 'City is required.';
    if (!capacity || Number(capacity) < 1) errs.capacity = 'Capacity must be at least 1 person.';

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setFormErrors({});
    setSaving(true);

    try {
      await api.post('/venues', {
        name,
        address,
        city,
        capacity: Number(capacity),
      });

      showToast(`Venue '${name}' registered successfully.`, 'success');
      setName('');
      setAddress('');
      setCity('');
      setCapacity('');
      setShowAddForm(false);
      refetch();
    } catch (err) {
      showToast(err.message || 'Failed to create venue.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVenue = async (venueId, venueName) => {
    if (!window.confirm(`Are you sure you want to delete '${venueName}'?`)) return;

    try {
      await api.delete(`/venues/${venueId}`);
      showToast(`Venue '${venueName}' deleted.`, 'success');
      refetch();
    } catch (err) {
      showToast(err.message || 'Failed to delete venue.', 'error');
    }
  };

  return (
    <div className="venues-management-page">
      <div className="page-header-strip">
        <div>
          <span className="font-mono text-muted page-badge">FACILITY DIRECTORY</span>
          <h1 className="page-title">Venues & Audit Capacities</h1>
          <p className="text-muted" style={{ fontSize: '0.9375rem' }}>
            Registered amphitheatres, halls, and studios available for event staging.
          </p>
        </div>

        <Button variant="primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Close Form' : '+ Add New Venue'}
        </Button>
      </div>

      {/* Add Venue Slide-down Form */}
      {showAddForm && (
        <form onSubmit={handleCreateVenue} className="venue-modal-card" noValidate>
          <h3 className="section-title" style={{ fontSize: '1.25rem' }}>
            Register New Venue
          </h3>

          <div className="form-grid-2">
            <Field label="Venue Name" htmlFor="v-name" error={formErrors.name} required>
              <Input
                id="v-name"
                placeholder="e.g. Beacon Amphitheater"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
                error={formErrors.name}
              />
            </Field>

            <Field label="City" htmlFor="v-city" error={formErrors.city} required>
              <Input
                id="v-city"
                placeholder="e.g. Seattle"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={saving}
                error={formErrors.city}
              />
            </Field>
          </div>

          <div className="form-grid-2">
            <Field label="Street Address" htmlFor="v-address" error={formErrors.address} required>
              <Input
                id="v-address"
                placeholder="e.g. 89 Shoreline Promenade"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={saving}
                error={formErrors.address}
              />
            </Field>

            <Field label="Maximum Seating Capacity" htmlFor="v-cap" error={formErrors.capacity} required>
              <Input
                id="v-cap"
                type="number"
                min="1"
                placeholder="e.g. 600"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                disabled={saving}
                error={formErrors.capacity}
              />
            </Field>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button type="submit" variant="primary" loading={saving}>
              Save Venue →
            </Button>
            <Button variant="ghost" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Search Input */}
      <div style={{ marginBottom: 'var(--space-4)', maxWidth: 360 }}>
        <Input
          placeholder="Search by venue name or city..."
          value={searchInput}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <Spinner message="Retrieving venue records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : venues.length === 0 ? (
        <EmptyState
          title="No venues registered"
          message="There are no venues matching your query."
          actionLabel="Add Venue"
          onAction={() => setShowAddForm(true)}
        />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <th>Venue Name</th>
                <th>City</th>
                <th>Address</th>
                <th>Capacity</th>
                <th>Managed By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((v) => (
                <tr key={v._id}>
                  <td data-label="Venue Name" style={{ fontWeight: 600 }}>
                    {v.name}
                  </td>
                  <td data-label="City" className="font-mono">
                    {v.city}
                  </td>
                  <td data-label="Address" className="text-muted">
                    {v.address}
                  </td>
                  <td data-label="Capacity" className="tabular-nums font-mono" style={{ fontWeight: 600 }}>
                    {v.capacity} seats
                  </td>
                  <td data-label="Managed By" className="font-mono text-muted" style={{ fontSize: '0.8125rem' }}>
                    {v.createdBy?.name || 'Admin'}
                  </td>
                  <td data-label="Actions">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteVenue(v._id, v.name)}
                    >
                      Delete
                    </Button>
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
        .venues-management-page {
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
        .venue-modal-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-ink);
          padding: var(--space-6);
          margin-bottom: var(--space-6);
          border-radius: var(--radius-sm);
        }
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }
        @media (max-width: 640px) {
          .form-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

