import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import Layout from './components/Layout';
import AdminRoute from './components/AdminRoute';
import OwnerRoute from './components/OwnerRoute';

// Lazy Load Pages
const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Books = lazy(() => import('./pages/Books'));
const Issues = lazy(() => import('./pages/Issues'));
const Reservations = lazy(() => import('./pages/Reservations'));
const Suggestions = lazy(() => import('./pages/Suggestions'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Profile = lazy(() => import('./pages/Profile'));
const BookDetails = lazy(() => import('./pages/BookDetails'));
const Extensions = lazy(() => import('./pages/Extensions'));
const Fines = lazy(() => import('./pages/Fines'));

// Admin Pages
const ManageBooks = lazy(() => import('./pages/admin/ManageBooks'));
const BookForm = lazy(() => import('./pages/admin/BookForm'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));
const IssueRequests = lazy(() => import('./pages/admin/IssueRequests'));
const ReviewModeration = lazy(() => import('./pages/admin/ReviewModeration'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const ExtensionRequests = lazy(() => import('./pages/admin/ExtensionRequests'));
const BookSuggestions = lazy(() => import('./pages/admin/BookSuggestions'));
const FinePayments = lazy(() => import('./pages/admin/FinePayments'));
const Settings = lazy(() => import('./pages/admin/Settings'));

// Owner Pages
const AuditLogs = lazy(() => import('./pages/owner/AuditLogs'));

// Protected Layout Component
const ProtectedLayout = () => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingSpinner />;
    if (!user) return <Navigate to="/" replace />;

    return <Layout />;
};



function App() {
    return (
        <AuthProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />

                        {/* Protected Routes (Layout Wrapper) */}
                        <Route element={<ProtectedLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />

                            {/* Student Routes */}
                            <Route path="/books" element={<Books />} />
                            <Route path="/books/:id" element={<BookDetails />} />
                            <Route path="/issues" element={<Issues />} />
                            <Route path="/reservations" element={<Reservations />} />
                            <Route path="/suggestions" element={<Suggestions />} />
                            <Route path="/reviews" element={<ReviewModeration />} />
                            <Route path="/notifications" element={<Notifications />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/extensions" element={<Extensions />} />
                            <Route path="/fines" element={<Fines />} />

                            {/* Admin Routes (Also accessible by Owner) */}
                            <Route path="/admin/books" element={<AdminRoute><ManageBooks /></AdminRoute>} />
                            <Route path="/admin/books/new" element={<AdminRoute><BookForm /></AdminRoute>} />
                            <Route path="/admin/books/edit/:id" element={<AdminRoute><BookForm /></AdminRoute>} />
                            <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
                            <Route path="/admin/requests" element={<AdminRoute><IssueRequests /></AdminRoute>} />
                            <Route path="/admin/reviews" element={<AdminRoute><ReviewModeration /></AdminRoute>} />
                            <Route path="/admin/reports" element={<AdminRoute><Reports /></AdminRoute>} />
                            <Route path="/admin/extensions" element={<AdminRoute><ExtensionRequests /></AdminRoute>} />
                            <Route path="/admin/suggestions" element={<AdminRoute><BookSuggestions /></AdminRoute>} />
                            <Route path="/admin/fines" element={<AdminRoute><FinePayments /></AdminRoute>} />
                            <Route path="/admin/settings" element={<AdminRoute><Settings /></AdminRoute>} />

                            {/* Owner Routes */}
                            <Route path="/owner/audit-logs" element={<OwnerRoute><AuditLogs /></OwnerRoute>} />
                        </Route>

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </Suspense>
            </Router>
        </AuthProvider>
    );
}

export default App;
