import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import navigateBackOrFallback from '../../utils/navigation';
import { useMeter, useUpdateMeter } from '../../hooks';
import { AppLayout } from '../../components/layout/AppLayout';
import MeterFormTabbed from '../../components/forms/MeterFormTabbed';
import type { MeterInput } from '../../types/meter';
import { MeterLoading, MeterError, MeterPageHeader } from './components/shared';

export const MeterEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: meter, loading: loadingMeter, error: meterError } = useMeter(id!);
  const { mutate: updateMeter, loading: updating } = useUpdateMeter();

  const handleSubmit = async (data: MeterInput) => {
    if (!id) return;

    try {
      await updateMeter({ id, data });
      navigateBackOrFallback(navigate, '/meters', { state: { message: 'Meter updated successfully!' } });
    } catch (error) {
      console.error('Failed to update meter:', error);
      throw error; // Re-throw to let the form handle it
    }
  };

  if (loadingMeter) {
    return (
      <AppLayout title="Edit Meter">
        <MeterLoading message="Loading meter..." />
      </AppLayout>
    );
  }

  if (meterError || !meter) {
    return (
      <AppLayout title="Edit Meter">
        <MeterError 
          title="Meter Not Found" 
          message="The meter you're trying to edit doesn't exist or has been deleted." 
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Edit Meter">
      <div className="max-w-4xl mx-auto space-y-6">
        <MeterPageHeader 
          title="Edit Meter" 
          subtitle="Update meter configuration and pricing" 
        />

        <MeterFormTabbed
          initialData={meter}
          onSubmit={handleSubmit}
          loading={updating}
          isEdit={true}
        />
      </div>
    </AppLayout>
  );
};