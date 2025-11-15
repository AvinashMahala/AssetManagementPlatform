import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCreateUnit } from '../../hooks';
import { useNotifications } from '../../contexts';
import UnitFormModern from '../../components/forms/UnitFormModern';
import type { UnitInput } from '../../types/unit';

export const UnitCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutate: createUnit, loading } = useCreateUnit();
  const { showSuccess, showError } = useNotifications();

  const propertyId = searchParams.get('propertyId');

  const handleSubmit = async (data: UnitInput) => {
    try {
      await createUnit(data);
      showSuccess('Unit created successfully!');
      navigate('/units');
    } catch (error) {
      console.error('Failed to create unit:', error);
      showError('Failed to create unit. Please try again.');
    }
  };

  return (
    <UnitFormModern
      onSubmit={handleSubmit}
      loading={loading}
      initialData={propertyId ? { propertyId } : undefined}
    />
  );
};
