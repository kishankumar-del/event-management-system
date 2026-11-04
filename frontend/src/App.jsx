import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleRoute } from './routes/RoleRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { EventDetailPage } from './pages/public/EventDetailPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';

// Attendee Pages
import { CheckoutPage } from './pages/attendee/CheckoutPage';
import { MyTicketsPage } from './pages/attendee/MyTicketsPage';
import { MyPaymentsPage } from './pages/attendee/MyPaymentsPage';

// Organizer Pages
import { OrganizerDashboard } from './pages/organizer/OrganizerDashboard';
import { MyEventsPage } from './pages/organizer/MyEventsPage';
import { EventFormPage } from './pages/organizer/EventFormPage';
import { VenuesPage } from './pages/organizer/VenuesPage';
import { TicketTypesPage } from './pages/organizer/TicketTypesPage';
import { RegistrationsPage } from './pages/organizer/RegistrationsPage';
import { PaymentsPage } from './pages/organizer/PaymentsPage';
import { ReportsPage } from './pages/organizer/ReportsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UsersPage } from './pages/admin/UsersPage';
import { AllEventsPage } from './pages/admin/AllEventsPage';
import { AllVenuesPage } from './pages/admin/AllVenuesPage';
import { AllRegistrationsPage } from './pages/admin/AllRegistrationsPage';
import { AllPaymentsPage } from './pages/admin/AllPaymentsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Layout Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Attendee Booking & History */}
              <Route path="/events/:id/register" element={<CheckoutPage />} />
              <Route
                path="/my-tickets"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['attendee', 'admin']}>
                      <MyTicketsPage />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-payments"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['attendee', 'admin']}>
                      <MyPaymentsPage />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Organizer Workbench Routes */}
            <Route
              path="/organizer"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['organizer', 'admin']}>
                    <DashboardLayout />
                  </RoleRoute>
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<OrganizerDashboard />} />
              <Route path="events" element={<MyEventsPage />} />
              <Route path="events/new" element={<EventFormPage />} />
              <Route path="events/:id/edit" element={<EventFormPage />} />
              <Route path="venues" element={<VenuesPage />} />
              <Route path="ticket-types" element={<TicketTypesPage />} />
              <Route path="registrations" element={<RegistrationsPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Admin Governance Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['admin']}>
                    <DashboardLayout />
                  </RoleRoute>
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="events" element={<AllEventsPage />} />
              <Route path="venues" element={<AllVenuesPage />} />
              <Route path="registrations" element={<AllRegistrationsPage />} />
              <Route path="payments" element={<AllPaymentsPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* 404 Fallback */}
            <Route
              path="*"
              element={
                <div style={{ padding: '80px 24px', textAlign: 'center' }}>
                  <h1 style={{ fontStyle: 'italic', fontFamily: 'var(--font-heading)' }}>
                    404 — Page Not Found
                  </h1>
                  <p style={{ marginTop: 8, color: 'var(--color-muted)' }}>
                    The admissions page you requested does not exist.
                  </p>
                  <a href="/" style={{ display: 'inline-block', marginTop: 16 }}>
                    Return to Box Office Home →
                  </a>
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
