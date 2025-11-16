import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCreateMeter } from '../../hooks';
import type { MeterInput } from '../../types/meter';
import MeterFormTabbed from '../../components/forms/MeterFormTabbed';

export const MeterCreatePageTabbed: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutate: createMeter, loading } = useCreateMeter();

  // Get pre-selected values from URL params
  const propertyId = searchParams.get('propertyId');
  const unitId = searchParams.get('unitId');

  const handleSubmit = async (data: MeterInput) => {
    try {
      await createMeter(data);
      navigate('/meters', {
        state: { message: 'Meter created successfully!' }
      });
    } catch (error) {
      console.error('Failed to create meter:', error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  const initialData: Partial<MeterInput> = {
    propertyId: propertyId || '',
    unitId: unitId || '',
  };

  return (
    <MeterFormTabbed
      initialData={initialData}
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
};