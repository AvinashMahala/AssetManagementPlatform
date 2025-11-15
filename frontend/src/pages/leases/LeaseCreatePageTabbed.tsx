import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateLease } from '../../hooks';
import { useNotifications } from '../../contexts';
import LeaseFormTabbed from '../../components/forms/LeaseFormTabbed';
import type { LeaseInput } from '../../types/lease';

const LeaseCreatePageTabbed: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: createLease, loading } = useCreateLease();
  const { showSuccess, showError } = useNotifications();

  const handleSubmit = async (data: LeaseInput) => {
    try {
      const response = await createLease(data);
      if (response.success && response.data) {
        // Navigate to the created lease's detail page if id is present, else go back to list
        const newId = (response.data as any).id;
        showSuccess('Lease created successfully!');
        navigate(newId ? `/leases/${newId}` : '/leases');
      } else {
        showError(response.error?.message || 'Failed to create lease');
      }
    } catch (err) {
      console.error('Create lease failed', err);
      showError('Failed to create lease. Please try again.');
    }
  };

  return (
    <LeaseFormTabbed
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
};

export default LeaseCreatePageTabbed;