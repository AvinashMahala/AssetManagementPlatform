import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { RegisterForm } from './RegisterForm';

// Mock useAuthContext with a mutable mock object so individual tests can override behavior
const authMock = {
  register: vi.fn().mockResolvedValue({ success: true }),
  loading: false,
};
vi.mock('@/contexts/AuthContext', () => ({ useAuthContext: () => authMock }));

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

  it('shows success notification on successful registration and clears form + switches to login', async () => {
    const onSwitchToLoginMock = vi.fn();
    render(<RegisterForm onSwitchToLogin={onSwitchToLoginMock} />);

    const username = screen.getByPlaceholderText('Choose a username') as HTMLInputElement;
    const email = screen.getByPlaceholderText('Enter your email') as HTMLInputElement;
    const password = screen.getByPlaceholderText('Create a password') as HTMLInputElement;
    const confirmPassword = screen.getByPlaceholderText('Confirm your password') as HTMLInputElement;
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

      // Ensure provided onSwitchToLogin handler is called
      expect(onSwitchToLoginMock).toHaveBeenCalledTimes(1);

      // Form inputs should be cleared
      expect(username.value).toBe('');
      expect(email.value).toBe('');
    });
  });

  it('shows error notification with server message on failure', async () => {
    // Replace the mocked register to return a failure with message
    const mockRegister = vi.fn().mockResolvedValue({ success: false, error: 'Email already exists' });
    // Override the registered mock
    authMock.register = mockRegister;

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