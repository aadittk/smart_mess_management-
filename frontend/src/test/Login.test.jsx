import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import * as AuthContextModule from '../context/AuthContext';

describe('Login Page Tests', () => {
  test('TC-FE-LOGIN-01: renders email, password inputs, and submit button', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      login: vi.fn(),
      isAuthenticated: false,
      isAdmin: false,
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
  });

  test('TC-FE-LOGIN-02: displays error alert when login fails', async () => {
    const mockLogin = vi.fn().mockResolvedValue({
      success: false,
      message: 'Invalid email or password.',
    });

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      isAdmin: false,
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'wrong@smartmess.edu' },
    });
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'badpass' },
    });

    fireEvent.click(screen.getByTestId('login-submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('login-error-alert')).toBeInTheDocument();
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
    });
  });
});
