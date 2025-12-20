import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import navigateBackOrFallback from '../../../utils/navigation';
import { useCreateMeter } from '../../../hooks';
import type { MeterInput } from '@/features/meters/types';
import { AppLayout } from '../../../components/layout/AppLayout';
import MeterFormTabbed from '@/features/meters/components/forms/MeterFormTabbed';
import { MeterPageHeader } from '../components';

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
      navigateBackOrFallback(navigate, '/meters', { state: { message: 'Meter created successfully!' } });
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
    <AppLayout title="Add Meter">
      <div className="max-w-4xl mx-auto space-y-6">
        <MeterPageHeader 
          title="Add Meter" 
          subtitle="Create a new utility meter" 
        />

        <MeterFormTabbed
          initialData={initialData}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </AppLayout>
  );
};
