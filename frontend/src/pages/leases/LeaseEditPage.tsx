import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import navigateBackOrFallback from '../../utils/navigation';
import { ArrowLeft } from 'lucide-react';
import { useLease, useUpdateLease } from '../../hooks';
import { Button } from '@/componentDesignLibrary';
import { AppLayout } from '../../components/layout/AppLayout';
import LeaseFormTabbed from '../../components/forms/LeaseFormTabbed';
import type { LeaseInput } from '../../types/lease';

export const LeaseEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: lease, loading: loadingLease, error: leaseError } = useLease(id!);
  const { mutate: updateLease, loading: updating } = useUpdateLease();

  const handleSubmit = async (data: LeaseInput) => {
    if (!id) return;

    try {
      await updateLease({ id, data });
      navigateBackOrFallback(navigate, '/leases', { state: { message: 'Lease updated successfully!' } });
    } catch (error) {
      console.error('Failed to update lease:', error);
      throw error; // Re-throw to let the form handle it
    }
  };

  if (loadingLease) {
    return (
      <AppLayout title="Edit Lease">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading lease...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (leaseError || !lease) {
    return (
      <AppLayout title="Edit Lease">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Lease Not Found</h2>
            <p className="text-gray-600 mb-4">The lease you're trying to edit doesn't exist or has been deleted.</p>
            <Button onClick={() => navigateBackOrFallback(navigate, '/leases')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leases
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Edit Lease">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigateBackOrFallback(navigate, '/leases')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leases
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Lease</h1>
            <p className="mt-2 text-gray-600">Update lease agreement details</p>
          </div>
        </div>

        <LeaseFormTabbed
          initialData={lease}
          onSubmit={handleSubmit}
          loading={updating}
          isEdit={true}
        />
      </div>
    </AppLayout>
  );
};
