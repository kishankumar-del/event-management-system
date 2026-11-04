import React from 'react';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Pagination } from '../../components/ui/Pagination';

export function MyPaymentsPage() {
  const {
    data: payments,
    loading,
    error,
    page,
    totalPages,
    total,
    limit,
    setPage,
    refetch,
  } = usePaginatedList('/payments', { limit: 10 });

  return (
    <div className="my-payments-page">
      <div className="page-header-strip">
        <div>
          <span className="font-mono text-muted page-badge">SETTLEMENT LEDGER</span>
          <h1 className="page-title">My Payment Receipts</h1>
          <p className="text-muted" style={{ fontSize: '0.9375rem' }}>
            Historical record of all transactions, simulated gateways, and settlement receipts.
          </p>
        </div>
      </div>

      {loading ? (
        <Spinner message="Retrieving transaction records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : payments.length === 0 ? (
        <EmptyState
          title="No payment records found"
          message="You have not made any ticket purchases yet."
        />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Event</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
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
                    <td data-label="Event" style={{ fontWeight: 500 }}>
                      {p.registration?.event?.title || 'Unknown Event'}
                    </td>
                    <td data-label="Method" className="font-mono" style={{ textTransform: 'uppercase' }}>
                      {p.method}
                    </td>
                    <td data-label="Amount" className="tabular-nums font-mono" style={{ fontWeight: 600 }}>
                      ${p.amount?.toFixed(2)}
                    </td>
                    <td data-label="Status">
                      <Badge status={p.status} />
                    </td>
                    <td data-label="Date" className="tabular-nums font-mono text-muted">
                      {formattedDate}
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
        .my-payments-page {
          max-width: 960px;
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
      `}</style>
    </div>
  );
}

