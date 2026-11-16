import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';
import ProtectedRoute from './components/ui/ProtectedRoute';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/admin/AdminLogin';

// Student Pages
import Dashboard from './pages/Dashboard';
import TodayMenu from './pages/TodayMenu';
import WeeklyMenu from './pages/WeeklyMenu';
import Attendance from './pages/Attendance';
import MyRatings from './pages/MyRatings';
import Complaints from './pages/Complaints';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import MenuManagement from './pages/admin/MenuManagement';
import StudentVerification from './pages/admin/StudentVerification';
import ManageStudents from './pages/admin/ManageStudents';
import ViewRatings from './pages/admin/ViewRatings';
import ComplaintManagement from './pages/admin/ComplaintManagement';
import AttendanceReports from './pages/admin/AttendanceReports';
import Analytics from './pages/admin/Analytics';

function AdminLayout({ children }) {
  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 64px)' }}>
      <Sidebar />
      <div style={{ flex: 1, overflowX: 'hidden' }}>{children}</div>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)' }}>404</h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        The dining page or administrative module you requested does not exist.
      </p>
      <a href="/" style={{ display: 'inline-block', marginTop: '1.5rem', fontWeight: 600 }}>
        &larr; Return to Homepage
      </a>
    </div>
  );
}

function AppRoutes() {
  const { isAdmin } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Student Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="student">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/today"
            element={
              <ProtectedRoute role="student">
                <TodayMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/weekly"
            element={
              <ProtectedRoute role="student">
                <WeeklyMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute role="student">
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ratings"
            element={
              <ProtectedRoute role="student">
                <MyRatings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints"
            element={
              <ProtectedRoute role="student">
                <Complaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute role="student">
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/menus"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <MenuManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/verifications"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <StudentVerification />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <ManageStudents />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ratings"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <ViewRatings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <ComplaintManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AttendanceReports />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <Analytics />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0f172a',
            color: '#ffffff',
            fontSize: '0.9rem',
            borderRadius: '8px',
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
