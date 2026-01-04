import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UtilityTypeForm } from '../../components/forms';
import { useUtilityType, useUpdateUtilityType } from '../../hooks/useUtilityTypes';
import { useNotifications } from '@/contexts';
import { AppLayout } from '@/components/layout/AppLayout';
import type { UtilityTypeInput } from '../../types';

export const UtilityTypeEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: utilityType, loading: fetching } = useUtilityType(id || '');
  const { mutate: updateUtilityType, loading: updating } = useUpdateUtilityType();
  const { showSuccess, showError } = useNotifications();

  const handleSubmit = async (data: UtilityTypeInput) => {
    if (!id) return;
    try {
      await updateUtilityType({ id, data });
      showSuccess('Utility type updated successfully');
      navigate('/admin/utility-types');
    } catch (error) {
      showError('Failed to update utility type');
    }
  };

  if (fetching) {
    return (
      <AppLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  if (!utilityType) {
    return (
      <AppLayout>
        <div>Utility type not found</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <UtilityTypeForm 
          initialData={utilityType} 
          onSubmit={handleSubmit} 
          loading={updating} 
          isEdit 
        />
      </div>
    </AppLayout>
  );
};
