import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import navigateBackOrFallback from '../../utils/navigation';
import { useCreateMeter } from '../../hooks';
import type { MeterInput } from '../../types/meter';
import { AppLayout } from '../../components/layout/AppLayout';
import MeterFormModern from '../../components/forms/MeterFormModern';

export const MeterCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutate: createMeter, loading } = useCreateMeter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Get pre-selected values from URL params
  const propertyId = searchParams.get('propertyId');
  const unitId = searchParams.get('unitId');

  const handleSubmit = async (data: MeterInput) => {
    try {
      setSubmitError(null);
      await createMeter(data);
      navigateBackOrFallback(navigate, '/meters', { state: { message: 'Meter created successfully!' } });
    } catch (err) {
      console.error('Failed to create meter:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create meter';
      setSubmitError(errorMessage);
      throw err; // Re-throw to let the form handle the error
    }
  };

  const initialData: Partial<MeterInput> = {
    propertyId: propertyId || '',
    unitId: unitId || '',
  };

  return (
    <AppLayout title="Add Meter">
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">{submitError}</p>
        </div>
      )}
      <MeterFormModern
        initialData={initialData}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </AppLayout>
  );
};