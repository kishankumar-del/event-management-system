import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Field } from '../../components/ui/Field';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';

export function TicketTypesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedEventParam = searchParams.get('event') || '';

  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(selectedEventParam);

  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [tierName, setTierName] = useState('');
  const [price, setPrice] = useState('50');
  const [quantityTotal, setQuantityTotal] = useState('100');
  const [saleStart, setSaleStart] = useState('');
  const [saleEnd, setSaleEnd] = useState('');
  const [saving, setSaving] = useState(false);

  // Load events
  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await api.get('/events?limit=100');
        const evList = res.data || [];
        setEvents(evList);
        if (!selectedEventId && evList.length > 0) {
          setSelectedEventId(evList[0]._id);
        }
      } catch (err) {
        setError(err.message || 'Failed to load events list.');
      }
    }
    loadEvents();
  }, []);

  // Sync event query param
  const handleSelectEvent = (eventId) => {
    setSelectedEventId(eventId);
    setSearchParams(eventId ? { event: eventId } : {});
  };

  // Fetch ticket types for selected event
  const fetchTiers = async () => {
    if (!selectedEventId) {
      setTicketTypes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/ticket-types?event=${selectedEventId}`);
      setTicketTypes(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load ticket tiers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, [selectedEventId]);

  const handleCreateTier = async (e) => {
    e.preventDefault();

    if (!tierName.trim() || !saleStart || !saleEnd) {
      showToast('Please fill in all required tier fields.', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.post('/ticket-types', {
        event: selectedEventId,
        name: tierName,
        price: Number(price),
        quantityTotal: Number(quantityTotal),
        saleStart: new Date(saleStart).toISOString(),
        saleEnd: new Date(saleEnd).toISOString(),
      });

      showToast(`Tier '${tierName}' created successfully.`, 'success');
      setTierName('');
      setShowAddForm(false);
      fetchTiers();
    } catch (err) {
      showToast(err.message || 'Failed to create ticket tier.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTier = async (tierId, tierName) => {
    if (!window.confirm(`Delete tier '${tierName}'?`)) return;

    try {
      await api.delete(`/ticket-types/${tierId}`);
      showToast(`Tier '${tierName}' deleted.`, 'success');
      fetchTiers();
    } catch (err) {
      showToast(err.message || 'Failed to delete tier.', 'error');
    }
  };

  return (
    <div className="ticket-types-page">
      <div className="page-header-strip">
        <div>
          <span className="font-mono text-muted page-badge">PRICING & ALLOCATION</span>
          <h1 className="page-title">Ticket Tiers & Quota Setup</h1>
          <p className="text-muted" style={{ fontSize: '0.9375rem' }}>
            Configure tier names, pricing, ticket release windows, and capacity caps.
          </p>
        </div>

        <Button
          variant="primary"
          disabled={!selectedEventId}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Close Form' : '+ New Ticket Tier'}
        </Button>
      </div>

      {/* Event Selector Toolbar */}
      <div className="event-selector-bar">
        <label htmlFor="select-event" className="font-mono text-muted" style={{ fontSize: '0.75rem' }}>
          SELECT EVENT PROGRAMME:
        </label>
        <Select
          id="select-event"
          value={selectedEventId}
          onChange={(e) => handleSelectEvent(e.target.value)}
          style={{ maxWidth: 440 }}
        >
          {events.map((ev) => (
            <option key={ev._id} value={ev._id}>
              {ev.title} ({ev.status})
            </option>
          ))}
        </Select>
      </div>

      {/* Add Tier Form */}
      {showAddForm && (
        <form onSubmit={handleCreateTier} className="tier-create-card">
          <h3 className="section-title" style={{ fontSize: '1.25rem' }}>
            Add Admission Tier
          </h3>

          <div className="form-grid-3">
            <Field label="Tier Name" htmlFor="t-name" required>
              <Input
                id="t-name"
                placeholder="e.g. Early Bird, VIP Box"
                value={tierName}
                onChange={(e) => setTierName(e.target.value)}
                disabled={saving}
              />
            </Field>

            <Field label="Price (USD)" htmlFor="t-price" required>
              <Input
                id="t-price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={saving}
              />
            </Field>

            <Field label="Total Quantity" htmlFor="t-qty" required>
              <Input
                id="t-qty"
                type="number"
                min="1"
                value={quantityTotal}
                onChange={(e) => setQuantityTotal(e.target.value)}
                disabled={saving}
              />
            </Field>
          </div>

          <div className="form-grid-2">
            <Field label="Sale Start Date & Time" htmlFor="t-start" required>
              <Input
                id="t-start"
                type="datetime-local"
                value={saleStart}
                onChange={(e) => setSaleStart(e.target.value)}
                disabled={saving}
              />
            </Field>

            <Field label="Sale End Date & Time" htmlFor="t-end" required>
              <Input
                id="t-end"
                type="datetime-local"
                value={saleEnd}
                onChange={(e) => setSaleEnd(e.target.value)}
                disabled={saving}
              />
            </Field>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button type="submit" variant="primary" loading={saving}>
              Save Tier Allocation →
            </Button>
            <Button variant="ghost" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <Spinner message="Retrieving ticket tiers..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTiers} />
      ) : ticketTypes.length === 0 ? (
        <EmptyState
          title="No ticket tiers created"
          message="This event has no ticket tiers defined. Attendees will not be able to book admissions until tiers are created."
          actionLabel="Add First Tier"
          onAction={() => setShowAddForm(true)}
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Tier Name</th>
              <th>Price</th>
              <th>Sold / Total</th>
              <th>Remaining</th>
              <th>Sale Window</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ticketTypes.map((t) => {
              const remaining = Math.max(0, t.quantityTotal - t.quantitySold);
              const start = new Date(t.saleStart).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });
              const end = new Date(t.saleEnd).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <tr key={t._id}>
                  <td data-label="Tier Name" style={{ fontWeight: 600 }}>
                    {t.name}
                  </td>
                  <td data-label="Price" className="tabular-nums font-mono">
                    ${t.price.toFixed(2)}
                  </td>
                  <td data-label="Sold / Total" className="tabular-nums font-mono">
                    {t.quantitySold} / {t.quantityTotal}
                  </td>
                  <td data-label="Remaining" className="tabular-nums font-mono">
                    {remaining} seats
                  </td>
                  <td data-label="Sale Window" className="font-mono text-muted" style={{ fontSize: '0.8125rem' }}>
                    {start} – {end}
                  </td>
                  <td data-label="Actions">
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={t.quantitySold > 0}
                      title={t.quantitySold > 0 ? 'Cannot delete tier with sold tickets' : 'Delete Tier'}
                      onClick={() => handleDeleteTier(t._id, t.name)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      <style>{`
        .ticket-types-page {
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
        .event-selector-bar {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          margin-bottom: var(--space-6);
        }
        .tier-create-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-ink);
          padding: var(--space-6);
          margin-bottom: var(--space-6);
          border-radius: var(--radius-sm);
        }
        .form-grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-4);
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

