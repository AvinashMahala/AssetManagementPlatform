import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UtilityTypeForm } from '../../components/forms';
import { useCreateUtilityType } from '../../hooks/useUtilityTypes';
import { useNotifications } from '@/contexts';
import { AppLayout } from '@/components/layout/AppLayout';
import type { UtilityTypeInput } from '../../types';

export const UtilityTypeCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: createUtilityType, loading } = useCreateUtilityType();
  const { showSuccess, showError } = useNotifications();

  const handleSubmit = async (data: UtilityTypeInput) => {
    try {
      await createUtilityType(data);
      showSuccess('Utility type created successfully');
      navigate('/admin/utility-types');
    } catch (error) {
      showError('Failed to create utility type');
    }
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <UtilityTypeForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </AppLayout>
  );
};
