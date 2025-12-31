import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { RegisterForm } from './RegisterForm';

// Mock useAuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: () => ({
    register: vi.fn().mockResolvedValue({ success: true }),
    loading: false,
  }),
}));

const showSuccessMock = vi.fn();
const showErrorMock = vi.fn();

vi.mock('@/contexts/NotificationContext', () => ({
  useNotifications: () => ({
    showSuccess: showSuccessMock,
    showError: showErrorMock,
  }),
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    showSuccessMock.mockClear();
    showErrorMock.mockClear();
  });

  it('shows success notification on successful registration', async () => {
    render(<RegisterForm />);

    const username = screen.getByPlaceholderText('Choose a username');
    const email = screen.getByPlaceholderText('Enter your email');
    const password = screen.getByPlaceholderText('Create a password');
    const confirmPassword = screen.getByPlaceholderText('Confirm your password');
    const submit = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(username, { target: { value: 'testuser' } });
    fireEvent.change(email, { target: { value: 'test@example.com' } });
    fireEvent.change(password, { target: { value: 'password123' } });
    fireEvent.change(confirmPassword, { target: { value: 'password123' } });

    fireEvent.click(submit);

    await waitFor(() => {
      expect(showSuccessMock).toHaveBeenCalledTimes(1);
      expect(showSuccessMock).toHaveBeenCalledWith(
        'Account Created',
        'Please check your email or phone to verify your account.'
      );
    });
  });

  it('shows error notification with server message on failure', async () => {
    // Replace the mocked register to return a failure with message
    const mockRegister = vi.fn().mockResolvedValue({ success: false, error: 'Email already exists' });
    vi.mocked(require('@/contexts/AuthContext').useAuthContext).mockReturnValue({ register: mockRegister, loading: false });

    render(<RegisterForm />);

    const username = screen.getByPlaceholderText('Choose a username');
    const email = screen.getByPlaceholderText('Enter your email');
    const password = screen.getByPlaceholderText('Create a password');
    const confirmPassword = screen.getByPlaceholderText('Confirm your password');
    const submit = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(username, { target: { value: 'testuser' } });
    fireEvent.change(email, { target: { value: 'test@example.com' } });
    fireEvent.change(password, { target: { value: 'password123' } });
    fireEvent.change(confirmPassword, { target: { value: 'password123' } });

    fireEvent.click(submit);

    await waitFor(() => {
      expect(showErrorMock).toHaveBeenCalledTimes(1);
      expect(showErrorMock).toHaveBeenCalledWith('Registration Failed', 'Email already exists');
    });
  });
});