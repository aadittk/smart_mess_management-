import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ui/ProtectedRoute';
import * as AuthContextModule from '../context/AuthContext';

describe('ProtectedRoute Component Tests', () => {
  test('TC-FE-PROT-01: redirects unauthenticated user to /login', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page Mock</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Secret Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page Mock')).toBeInTheDocument();
    expect(screen.queryByText('Secret Dashboard')).not.toBeInTheDocument();
  });

  test('TC-FE-PROT-02: renders protected component when user is authenticated with matching role', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      user: { id: 's-1', role: 'student', name: 'Student 1' },
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="student">
                <div>Student Dashboard Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Student Dashboard Content')).toBeInTheDocument();
  });

  test('TC-FE-PROT-03: redirects student trying to access admin-only route to /dashboard', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      user: { id: 's-1', role: 'student' },
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/admin/menus']}>
        <Routes>
          <Route path="/dashboard" element={<div>Student Home</div>} />
          <Route
            path="/admin/menus"
            element={
              <ProtectedRoute role="admin">
                <div>Admin Menus</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Student Home')).toBeInTheDocument();
    expect(screen.queryByText('Admin Menus')).not.toBeInTheDocument();
  });
});
