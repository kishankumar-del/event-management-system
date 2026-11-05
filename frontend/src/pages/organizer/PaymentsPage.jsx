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

export function PaymentsPage() {
  const { showToast } = useToast();
  const {
    data: payments,
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
  } = usePaginatedList('/payments', { limit: 10 });

  const [refundingId, setRefundingId] = useState(null);

  const handleRefund = async (paymentId, refCode) => {
    if (!window.confirm(`Are you sure you want to refund payment ${refCode}? This will cancel the linked registration and restore tickets.`)) {
      return;
    }

    setRefundingId(paymentId);
    try {
      await api.patch(`/payments/${paymentId}/refund`);
      showToast(`Payment ${refCode} refunded successfully.`, 'success');
      refetch();
    } catch (err) {
      showToast(err.message || 'Refund processing failed.', 'error');
    } finally {
      setRefundingId(null);
    }
  };

  return (
    <div className="payments-management-page">
      <div className="page-header-strip">
        <div>
          <span className="font-mono text-muted page-badge">TRANSACTION LEDGER</span>
          <h1 className="page-title">Event Payment Receipts & Refunds</h1>
          <p className="text-muted" style={{ fontSize: '0.9375rem' }}>
            Full financial audit trail of admissions paid, gateways used, and refund executions.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="payment-filter-bar">
        <div style={{ flex: 1, minWidth: 240 }}>
          <Input
            placeholder="Search reference code (e.g. PAY-1234-5678)..."
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
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Failed</option>
          </Select>
        </div>

        <div style={{ minWidth: 160 }}>
          <Select
            value={filters.method || ''}
            onChange={(e) => setFilter('method', e.target.value)}
          >
            <option value="">All Methods</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
          </Select>
        </div>
      </div>

      {loading ? (
        <Spinner message="Retrieving transaction ledger..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : payments.length === 0 ? (
        <EmptyState
          title="No transactions found"
          message="No payment transactions match the selected filters or reference."
        />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Attendee</th>
                <th>Event</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const date = p.paidAt || p.createdAt;
                const formattedDate = date
                  ? new Date(date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'N/A';

                return (
                  <tr key={p._id}>
                    <td data-label="Reference" className="font-mono" style={{ fontWeight: 600 }}>
                      {p.reference}
                    </td>
                    <td data-label="Attendee">
                      <div>{p.registration?.user?.name || 'Attendee'}</div>
                      <div className="font-mono text-muted" style={{ fontSize: '0.75rem' }}>
                        {p.registration?.user?.email}
                      </div>
                    </td>
                    <td data-label="Event" style={{ fontWeight: 500 }}>
                      {p.registration?.event?.title || 'Event'}
                    </td>
                    <td data-label="Method" className="font-mono" style={{ textTransform: 'uppercase' }}>
                      {p.method}
                    </td>
                    <td data-label="Amount" className="tabular-nums font-mono" style={{ fontWeight: 600 }}>
                      ₹{p.amount?.toFixed(2)}
                    </td>
                    <td data-label="Status">
                      <Badge status={p.status} />
                    </td>
                    <td data-label="Date" className="tabular-nums font-mono text-muted">
                      {formattedDate}
                    </td>
                    <td data-label="Actions">
                      {p.status === 'paid' ? (
                        <Button
                          variant="danger"
                          size="sm"
                          loading={refundingId === p._id}
                          onClick={() => handleRefund(p._id, p.reference)}
                        >
                          Refund
                        </Button>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                          Settled
                        </span>
                      )}
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
        .payments-management-page {
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
        .payment-filter-bar {
          display: flex;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
}

