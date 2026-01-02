import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import navigateBackOrFallback from '@/utils/navigation';
import { ArrowLeft } from 'lucide-react';
import { useUnit, useUpdateUnit } from '@/features/units/hooks/useUnits';
import { Button } from '@/componentDesignLibrary';
import { PageLoadingSpinner } from '@/componentDesignLibrary';
import { AppLayout } from '@/components/layout/AppLayout';
import UnitFormTabbed from '@/features/units/components/forms/UnitFormTabbed';
import { AdminAuditModal } from '@/features/common/components/AdminAuditModal';
import type { UnitInput } from '@/features/units/types';
import './UnitEditPage.module.scss';

export const UnitEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: unit, loading: loadingUnit, error: loadError } = useUnit(id!);
  const { mutate: updateUnit, loading: updating } = useUpdateUnit();

  const [auditOpen, setAuditOpen] = React.useState(false);
  const [auditData, setAuditData] = React.useState<any | null>(null);

  const handleSubmit = async (data: UnitInput, options?: { audit?: boolean }) => {
    if (!id) return;

    try {
      const resp = await updateUnit({ id, data, audit: options?.audit });

      if (!resp.success) {
        if (resp.error && String(resp.error.code).toUpperCase() === 'DUPLICATE_UNIT') {
          // Surface duplicate error to the form
          throw new Error(resp.error.message || 'Duplicate unit exists');
        }
        throw new Error(resp.error?.message || 'Failed to update unit');
      }

      const respData = resp.data;
      if (options?.audit && respData && (respData as any).dataAudit) {
        const audit = (respData as any).dataAudit;
        if (!audit.success) {
          setAuditData(audit);
          setAuditOpen(true);
          return;
        }
      }

      navigateBackOrFallback(navigate, '/units', { state: { message: 'Unit updated successfully!' } });
    } catch (error) {
      console.error('Failed to update unit:', error);
      throw error; // Re-throw to let the form handle it
    }
  };

  if (loadingUnit) {
    return (
      <AppLayout title="Edit Unit">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <PageLoadingSpinner text="Loading unit..." />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (loadError || !unit) {
    return (
      <AppLayout title="Edit Unit">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unit Not Found</h2>
            <p className="text-gray-600 mb-4">The unit you're trying to edit doesn't exist or has been deleted.</p>
            <Button onClick={() => navigateBackOrFallback(navigate, '/units')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Units
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Edit Unit">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigateBackOrFallback(navigate, '/units')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Units
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Unit</h1>
            <p className="mt-2 text-gray-600">Update unit record details</p>
          </div>
        </div>

        <UnitFormTabbed
          initialData={unit}
          onSubmit={handleSubmit}
          loading={updating}
          isEdit={true}
        />

        <AdminAuditModal
          open={auditOpen}
          audit={auditData}
          onClose={() => {
            setAuditOpen(false);
            navigateBackOrFallback(navigate, '/units', { state: { message: 'Unit updated with audit mismatches' } });
          }}
        />
      </div>
    </AppLayout>
  );
};
