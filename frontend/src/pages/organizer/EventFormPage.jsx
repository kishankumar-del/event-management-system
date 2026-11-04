import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Field } from '../../components/ui/Field';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

const CATEGORIES = [
  'Conference',
  'Concert',
  'Workshop',
  'Seminar',
  'Meetup',
  'Festival',
  'Exhibition',
  'Other',
];

export function EventFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Concert');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [venue, setVenue] = useState('');
  const [capacity, setCapacity] = useState('');
  const [status, setStatus] = useState('draft');

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // Load venues and existing event if editing
  useEffect(() => {
    async function loadInitialData() {
      try {
        const venuesRes = await api.get('/venues?limit=100');
        const venueList = venuesRes.data || [];
        setVenues(venueList);
        if (!venue && venueList.length > 0) {
          setVenue(venueList[0]._id);
        }

        if (isEdit) {
          const eventRes = await api.get(`/events/${id}`);
          const ev = eventRes.data;
          setTitle(ev.title || '');
          setDescription(ev.description || '');
          setCategory(ev.category || 'Concert');
          setStartDate(ev.startDate ? ev.startDate.substring(0, 16) : '');
          setEndDate(ev.endDate ? ev.endDate.substring(0, 16) : '');
          setVenue(ev.venue?._id || ev.venue || '');
          setCapacity(ev.capacity ? String(ev.capacity) : '');
          setStatus(ev.status || 'draft');
        }
      } catch (err) {
        setServerError(err.message || 'Failed to initialize event form data.');
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Client-side validation matching Express rules
    const vErrors = {};
    if (!title.trim()) vErrors.title = 'Event title is required.';
    if (!description.trim()) vErrors.description = 'Description is required.';
    if (!startDate) vErrors.startDate = 'Start date is required.';
    if (!endDate) vErrors.endDate = 'End date is required.';
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      vErrors.endDate = 'End date must be greater than or equal to start date.';
    }
    if (!venue) vErrors.venue = 'Please select a venue.';
    if (!capacity || Number(capacity) < 1) {
      vErrors.capacity = 'Capacity must be at least 1 person.';
    }

    const selectedVenueDoc = venues.find((v) => v._id === venue);
    if (selectedVenueDoc && Number(capacity) > selectedVenueDoc.capacity) {
      vErrors.capacity = `Capacity cannot exceed venue limit (${selectedVenueDoc.capacity}).`;
    }

    if (Object.keys(vErrors).length > 0) {
      setErrors(vErrors);
      return;
    }

    setErrors({});
    setSaving(true);

    const payload = {
      title,
      description,
      category,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      venue,
      capacity: Number(capacity),
      status,
    };

    try {
      if (isEdit) {
        await api.patch(`/events/${id}`, payload);
        showToast('Event updated successfully.', 'success');
      } else {
        await api.post('/events', payload);
        showToast('Event created successfully as draft.', 'success');
      }
      navigate('/organizer/events');
    } catch (err) {
      setServerError(err.message || 'Failed to save event.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spinner message="Loading event editor..." />;
  }

  return (
    <div className="event-form-page">
      <div className="form-header-bar">
        <Link to="/organizer/events" className="breadcrumb-link">
          ← Back to My Events
        </Link>
        <h1 className="page-title" style={{ marginTop: 'var(--space-2)' }}>
          {isEdit ? 'Edit Event Programme' : 'Create New Event Programme'}
        </h1>
      </div>

      {serverError ? (
        <div className="form-error-banner" role="alert">
          {serverError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="event-editor-card" noValidate>
        <Field label="Event Title" htmlFor="event-title" error={errors.title} required>
          <Input
            id="event-title"
            placeholder="e.g. Midwest Chamber Symphonia"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={saving}
            error={errors.title}
          />
        </Field>

        <Field label="Programme Description" htmlFor="event-desc" error={errors.description} required>
          <textarea
            id="event-desc"
            rows={4}
            className="form-textarea"
            placeholder="Detailed narrative describing the performance, speakers, agenda, or syllabus..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={saving}
          />
        </Field>

        <div className="form-grid-2">
          <Field label="Category" htmlFor="event-category" required>
            <Select
              id="event-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={saving}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Venue Location" htmlFor="event-venue" error={errors.venue} required>
            <Select
              id="event-venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              disabled={saving}
              error={errors.venue}
            >
              <option value="">Select a Venue</option>
              {venues.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name} ({v.city} • Capacity: {v.capacity})
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="form-grid-2">
          <Field label="Start Date & Time" htmlFor="event-start" error={errors.startDate} required>
            <Input
              id="event-start"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={saving}
              error={errors.startDate}
            />
          </Field>

          <Field label="End Date & Time" htmlFor="event-end" error={errors.endDate} required>
            <Input
              id="event-end"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={saving}
              error={errors.endDate}
            />
          </Field>
        </div>

        <div className="form-grid-2">
          <Field
            label="Planned Admission Capacity"
            htmlFor="event-capacity"
            hint="Cannot exceed selected venue limit"
            error={errors.capacity}
            required
          >
            <Input
              id="event-capacity"
              type="number"
              min="1"
              placeholder="e.g. 500"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              disabled={saving}
              error={errors.capacity}
            />
          </Field>

          <Field label="Initial Lifecycle Status" htmlFor="event-status" required>
            <Select
              id="event-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={saving}
            >
              <option value="draft">Draft (Visible only to you)</option>
              <option value="published">Published (Visible in public catalogue)</option>
              {isEdit && <option value="completed">Completed</option>}
              {isEdit && <option value="cancelled">Cancelled</option>}
            </Select>
          </Field>
        </div>

        <div className="form-actions-row">
          <Button type="submit" variant="primary" loading={saving}>
            {isEdit ? 'Save Changes' : 'Create Event'} →
          </Button>
          <Link to="/organizer/events">
            <Button variant="ghost">Cancel</Button>
          </Link>
        </div>
      </form>

      <style>{`
        .event-form-page {
          max-width: 800px;
          margin: 0 auto;
        }
        .form-header-bar {
          margin-bottom: var(--space-6);
          border-bottom: var(--border-hairline);
          padding-bottom: var(--space-4);
        }
        .breadcrumb-link {
          font-size: 0.8125rem;
          color: var(--color-muted);
          text-decoration: none;
        }
        .form-error-banner {
          background-color: #FDF0ED;
          border: 1px solid var(--color-danger);
          color: var(--color-danger);
          padding: var(--space-3) var(--space-4);
          font-size: 0.875rem;
          margin-bottom: var(--space-4);
          border-radius: var(--radius-sm);
        }
        .event-editor-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-rule);
          padding: var(--space-6);
          border-radius: var(--radius-sm);
        }
        .form-textarea {
          width: 100%;
          padding: var(--space-3);
          background-color: var(--color-surface);
          border: 1px solid var(--color-rule);
          border-radius: var(--radius-sm);
          font-family: var(--font-ui);
          font-size: 0.9375rem;
          color: var(--color-ink);
          resize: vertical;
        }
        .form-textarea:focus-visible {
          border-color: var(--color-accent);
          outline: 2px solid var(--color-accent);
          outline-offset: 1px;
        }
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }
        .form-actions-row {
          display: flex;
          gap: var(--space-3);
          margin-top: var(--space-6);
          border-top: 1px solid var(--color-rule);
          padding-top: var(--space-4);
        }
        @media (max-width: 640px) {
          .form-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

