import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useMeter, useUpdateMeter } from '../../hooks';
import { Button } from '../../components/ui/button';
import { AppLayout } from '../../components/layout/AppLayout';
import MeterFormTabbed from '../../components/forms/MeterFormTabbed';
import type { MeterInput } from '../../types/meter';

export const MeterEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: meter, loading: loadingMeter, error: meterError } = useMeter(id!);
  const { mutate: updateMeter, loading: updating } = useUpdateMeter();

  const handleSubmit = async (data: MeterInput) => {
    if (!id) return;

    try {
      await updateMeter({ id, data });
      navigate('/meters', {
        state: { message: 'Meter updated successfully!' }
      });
    } catch (error) {
      console.error('Failed to update meter:', error);
      throw error; // Re-throw to let the form handle it
    }
  };

  if (loadingMeter) {
    return (
      <AppLayout title="Edit Meter">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading meter...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (meterError || !meter) {
    return (
      <AppLayout title="Edit Meter">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Meter Not Found</h2>
            <p className="text-gray-600 mb-4">The meter you're trying to edit doesn't exist or has been deleted.</p>
            <Button onClick={() => navigate('/meters')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Meters
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Edit Meter">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/meters')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Meters
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Meter</h1>
            <p className="mt-2 text-gray-600">Update meter configuration and pricing</p>
          </div>
        </div>

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