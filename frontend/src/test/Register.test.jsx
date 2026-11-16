import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Register';
import * as AuthContextModule from '../context/AuthContext';

describe('Register Page Tests', () => {
  test('TC-FE-REG-01: renders all registration input fields', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      register: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    expect(screen.getByTestId('register-name')).toBeInTheDocument();
    expect(screen.getByTestId('register-email')).toBeInTheDocument();
    expect(screen.getByTestId('register-roll')).toBeInTheDocument();
    expect(screen.getByTestId('register-hostel')).toBeInTheDocument();
    expect(screen.getByTestId('register-room')).toBeInTheDocument();
    expect(screen.getByTestId('register-phone')).toBeInTheDocument();
    expect(screen.getByTestId('register-password')).toBeInTheDocument();
    expect(screen.getByTestId('register-confirm-password')).toBeInTheDocument();
  });

  test('TC-FE-REG-02: shows error alert when passwords do not match', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      register: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByTestId('register-name'), { target: { value: 'Aarav' } });
    fireEvent.change(screen.getByTestId('register-email'), { target: { value: 'aarav@edu' } });
    fireEvent.change(screen.getByTestId('register-roll'), { target: { value: 'CS01' } });
    fireEvent.change(screen.getByTestId('register-room'), { target: { value: '101' } });
    fireEvent.change(screen.getByTestId('register-phone'), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByTestId('register-password'), { target: { value: 'pass123' } });
    fireEvent.change(screen.getByTestId('register-confirm-password'), { target: { value: 'pass999' } });

    fireEvent.click(screen.getByTestId('register-submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('register-error-alert')).toBeInTheDocument();
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  test('TC-FE-REG-03: renders pending verification notice on successful registration', async () => {
    const mockRegister = vi.fn().mockResolvedValue({
      success: true,
      message: 'Registration submitted',
    });

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      register: mockRegister,
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByTestId('register-name'), { target: { value: 'Aarav Sharma' } });
    fireEvent.change(screen.getByTestId('register-email'), { target: { value: 'aarav@smartmess.edu' } });
    fireEvent.change(screen.getByTestId('register-roll'), { target: { value: 'CS2024001' } });
    fireEvent.change(screen.getByTestId('register-room'), { target: { value: 'B-204' } });
    fireEvent.change(screen.getByTestId('register-phone'), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByTestId('register-password'), { target: { value: 'Password@123' } });
    fireEvent.change(screen.getByTestId('register-confirm-password'), { target: { value: 'Password@123' } });

    fireEvent.click(screen.getByTestId('register-submit-button'));

    await waitFor(() => {
      expect(screen.getByText(/Registration Submitted!/i)).toBeInTheDocument();
      expect(screen.getByText(/unverified status/i)).toBeInTheDocument();
    });
  });
});
