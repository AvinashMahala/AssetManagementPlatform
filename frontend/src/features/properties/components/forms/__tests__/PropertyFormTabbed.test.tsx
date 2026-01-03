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

  test('blocks navigation to next tab when there are validation errors in the form', async () => {
    const mockSubmit = vi.fn();

    render(
      <MemoryRouter>
        <PropertyFormTabbed onSubmit={mockSubmit} />
      </MemoryRouter>
    );

    // Attempt to proceed to next tab without filling required fields
    const nextBtn = screen.getByRole('button', { name: /next/i });
    userEvent.click(nextBtn);

    // The active tab should remain on the first tab and show validation error
    expect(await screen.findByText(/Property name is required/i)).toBeInTheDocument();
    // Ensure that Owner Name (which is on a later tab) is not visible yet
    expect(screen.queryByLabelText(/Owner Name/i)).not.toBeInTheDocument();
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

  test('shows validation error when name exceeds 255 chars', async () => {
    const mockSubmit = vi.fn();

    render(
      <MemoryRouter>
        <PropertyFormTabbed onSubmit={mockSubmit} />
      </MemoryRouter>
    );

    const longName = 'x'.repeat(260);
    const nameInput = screen.getByPlaceholderText(/Enter property name/i);
    userEvent.type(nameInput, longName);

    const createBtn = screen.getByRole('button', { name: /create property/i });
    userEvent.click(createBtn);

    expect(await screen.findByText(/Property name must be at most 255 characters/i)).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test('owner dropdown shows disabled "No owners found" item when there are no users', async () => {
    // Render BasicTab directly with no users
    const { default: BasicTab } = await import('../tabs/BasicTab');
    const { buildInitialState } = await import('../initialState');

    const formData = buildInitialState({}, false, 'user-1');

    render(
      <MemoryRouter>
        <BasicTab formData={formData} errors={{}} users={[]} usersLoading={false} onChange={vi.fn()} />
      </MemoryRouter>
    );

    // Open the owner select via the label's combobox
    const ownerLabel = screen.getByText(/Owner Name/i);
    const ownerTrigger = ownerLabel.parentElement?.querySelector('button[role="combobox"]') as HTMLElement;
    expect(ownerTrigger).toBeTruthy();
    userEvent.click(ownerTrigger);

    // Expect to see the 'No owners found' item and that it's disabled
    const noOwners = await screen.findByText(/No owners found/i);
    expect(noOwners).toBeInTheDocument();
    // Ensure the item is disabled (Radix sets aria-disabled)
    expect(noOwners.closest('[aria-disabled="true"]')).not.toBeNull();
  });

  test('owner dropdown shows users when users are available', async () => {
    const { default: BasicTab } = await import('../tabs/BasicTab');
    const { buildInitialState } = await import('../initialState');

    const formData = buildInitialState({}, false, 'user-1');
    const users = [
      { id: 'u1', name: 'Alice', username: 'alice' },
      { id: 'u2', name: 'Bob', username: 'bob' }
    ];

    render(
      <MemoryRouter>
        <BasicTab formData={formData} errors={{}} users={users} usersLoading={false} onChange={vi.fn()} />
      </MemoryRouter>
    );

    // Open the owner select via the label's combobox
    const ownerLabel = screen.getByText(/Owner Name/i);
    const ownerTrigger = ownerLabel.parentElement?.querySelector('button[role="combobox"]') as HTMLElement;
    expect(ownerTrigger).toBeTruthy();
    userEvent.click(ownerTrigger);

    // Expect to see the user names
    expect(await screen.findByText(/Alice/i)).toBeInTheDocument();
    expect(await screen.findByText(/Bob/i)).toBeInTheDocument();
  });

  test('Next moves to Address tab when Basic tab is valid', async () => {
    const mockSubmit = vi.fn();

    render(
      <MemoryRouter>
        <PropertyFormTabbed onSubmit={mockSubmit} />
      </MemoryRouter>
    );

    // Fill property name
    const nameInput = screen.getByPlaceholderText(/Enter property name/i);
    userEvent.type(nameInput, 'My Property');

    // Open property type select and pick 'APARTMENT'
    const typeLabel = screen.getByText(/Property Type/i);
    const typeTrigger = typeLabel.parentElement?.querySelector('button[role="combobox"]') as HTMLElement;
    expect(typeTrigger).toBeTruthy();
    userEvent.click(typeTrigger);
    // The display is uppercased
    const typeOption = await screen.findByText(/APARTMENT/i);
    userEvent.click(typeOption);

    // Open owner select and pick the mocked user
    const ownerLabel = screen.getByText(/Owner Name/i);
    const ownerTrigger = ownerLabel.parentElement?.querySelector('button[role="combobox"]') as HTMLElement;
    expect(ownerTrigger).toBeTruthy();
    userEvent.click(ownerTrigger);
    const ownerOption = await screen.findByText(/Test User/i);
    userEvent.click(ownerOption);

    // Click Next
    const nextBtn = screen.getByRole('button', { name: /next/i });
    userEvent.click(nextBtn);

    // Expect Address tab content to be visible
    expect(await screen.findByLabelText(/Street Address/i)).toBeInTheDocument();
  });
});
