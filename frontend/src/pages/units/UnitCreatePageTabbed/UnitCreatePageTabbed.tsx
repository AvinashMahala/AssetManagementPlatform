import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import navigateBackOrFallback from '../../../utils/navigation';
import { useCreateUnit } from '../../../hooks';
import { useNotifications } from '../../../contexts';
import UnitFormTabbed from '../../../components/forms/UnitFormTabbed';
import type { UnitInput } from '../../../types/unit';
import './UnitCreatePageTabbed.scss';

export const UnitCreatePageTabbed: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutate: createUnit, loading } = useCreateUnit();
  const { showSuccess, showError } = useNotifications();

  const propertyId = searchParams.get('propertyId');

  const handleSubmit = async (data: UnitInput) => {
    try {
      await createUnit(data);
      showSuccess('Unit created successfully!');
      navigateBackOrFallback(navigate, '/units');
    } catch (error) {
      console.error('Failed to create unit:', error);
      showError('Failed to create unit. Please try again.');
    }
  };

  return (
    <UnitFormTabbed
      onSubmit={handleSubmit}
      loading={loading}
      initialData={propertyId ? { propertyId } : undefined}
    />
  );
};