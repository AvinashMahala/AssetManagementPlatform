import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PropertyFormTabbed from '../PropertyFormTabbed';

// Mock hooks used by the component to keep tests deterministic
vi.mock('../../../hooks', () => {
  return {
    useAuth: () => ({ user: { id: 'user-1', name: 'Test User' } }),
    useUsers: () => ({ data: [{ id: 'user-1', name: 'Test User' }], loading: false, error: null }),
    useUser: (_id: string | null | undefined) => ({ data: undefined, loading: false }),
  };
});

describe('PropertyFormTabbed', () => {
  test('shows validation errors when required fields are missing and prevents submit', async () => {
    const mockSubmit = vi.fn();

    render(
      <MemoryRouter>
        <PropertyFormTabbed onSubmit={mockSubmit} />
      </MemoryRouter>
    );

    // Click the create button
    const createBtn = screen.getByRole('button', { name: /create property/i });
    fireEvent.click(createBtn);

    // Expect to see validation error for property name
    expect(await screen.findByText(/Property name is required/i)).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test('displays server submit error when onSubmit rejects', async () => {
    const mockSubmit = vi.fn().mockRejectedValue(new Error('Server failed'));

    render(
      <MemoryRouter>
        <PropertyFormTabbed
          onSubmit={mockSubmit}
          initialData={{
            name: 'My Property',
            address: { street: '123 St', city: 'City', state: 'State', pincode: '400001', country: 'India', landmark: '' },
            totalArea: 100,
            ownerDetails: { name: 'Owner', mobileNumbers: ['9999999999'], emailIds: ['owner@example.com'], website: '' }
          }}
        />
      </MemoryRouter>
    );

    const createBtn = screen.getByRole('button', { name: /create property/i });
    userEvent.click(createBtn);

    // Expect server error to show up
    expect(await screen.findByRole('alert')).toHaveTextContent(/Server failed/i);
    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });
});
