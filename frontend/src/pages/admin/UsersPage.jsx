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

export function UsersPage() {
  const { showToast } = useToast();
  const {
    data: users,
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
  } = usePaginatedList('/users', { limit: 10 });

  const [updatingId, setUpdatingId] = useState(null);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      await api.patch(`/users/${userId}`, { role: newRole });
      showToast(`User role updated to ${newRole}.`, 'success');
      refetch();
    } catch (err) {
      showToast(err.message || 'Failed to update user role.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    setUpdatingId(userId);
    try {
      await api.patch(`/users/${userId}`, { isActive: !currentStatus });
      showToast(`User account ${currentStatus ? 'deactivated' : 'activated'}.`, 'success');
      refetch();
    } catch (err) {
      showToast(err.message || 'Failed to update status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="users-management-page">
      <div className="page-header-strip">
        <div>
          <span className="font-mono text-muted page-badge">ACCESS GOVERNANCE</span>
          <h1 className="page-title">User Accounts & RBAC Authority</h1>
          <p className="text-muted" style={{ fontSize: '0.9375rem' }}>
            Audit all registered attendees, organizers, and platform administrators.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="user-filter-bar">
        <div style={{ flex: 1, minWidth: 240 }}>
          <Input
            placeholder="Search by name or email address..."
            value={searchInput}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ minWidth: 160 }}>
          <Select
            value={filters.role || ''}
            onChange={(e) => setFilter('role', e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="attendee">Attendee</option>
            <option value="organizer">Organizer</option>
            <option value="admin">Admin</option>
          </Select>
        </div>

        <div style={{ minWidth: 160 }}>
          <Select
            value={filters.isActive || ''}
            onChange={(e) => setFilter('isActive', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Deactivated Only</option>
          </Select>
        </div>
      </div>

      {loading ? (
        <Spinner message="Retrieving account directory..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : users.length === 0 ? (
        <EmptyState
          title="No users match selection"
          message="No user profiles correspond to the applied query filters."
        />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const joinedDate = u.createdAt
                  ? new Date(u.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'N/A';

                return (
                  <tr key={u._id}>
                    <td data-label="Name" style={{ fontWeight: 600 }}>
                      {u.name}
                    </td>
                    <td data-label="Email" className="font-mono text-muted">
                      {u.email}
                    </td>
                    <td data-label="Role">
                      <Select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        disabled={updatingId === u._id}
                        style={{ minHeight: 32, fontSize: '0.8125rem' }}
                      >
                        <option value="attendee">Attendee</option>
                        <option value="organizer">Organizer</option>
                        <option value="admin">Admin</option>
                      </Select>
                    </td>
                    <td data-label="Status">
                      <Badge status={u.isActive ? 'active' : 'inactive'} />
                    </td>
                    <td data-label="Joined" className="tabular-nums font-mono text-muted">
                      {joinedDate}
                    </td>
                    <td data-label="Actions">
                      <Button
                        variant={u.isActive ? 'danger' : 'primary'}
                        size="sm"
                        loading={updatingId === u._id}
                        onClick={() => handleToggleActive(u._id, u.isActive)}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
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
        .users-management-page {
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
        .user-filter-bar {
          display: flex;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
}

