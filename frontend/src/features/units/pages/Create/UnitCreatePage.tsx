import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import navigateBackOrFallback from '@/utils/navigation';
import { useCreateUnit } from '@/features/units/hooks/useUnits';
import { useNotifications } from '@/contexts';
import UnitFormTabbed from '@/features/units/components/forms/UnitFormTabbed';
import type { UnitInput } from '@/features/units/types';
import './UnitCreatePage.module.scss';

export const UnitCreatePageTabbed: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutate: createUnit, loading } = useCreateUnit();
  const { showSuccess, showError } = useNotifications();

  const propertyId = searchParams.get('propertyId');

  const handleSubmit = async (data: UnitInput, options?: { audit?: boolean }) => {
    try {
      const resp = await createUnit({ data, audit: options?.audit });

      if (!resp.success) {
        // Handle duplicate conflict
        if (resp.error && String(resp.error.code).toUpperCase() === 'DUPLICATE_UNIT') {
          const detailMsg = resp.error.details ? ` Details: ${JSON.stringify(resp.error.details)}` : '';
          showError((resp.error.message || 'Duplicate unit exists. Please change identifiers.') + detailMsg);
          return;
        }
        showError(resp.error?.message || 'Failed to create unit. Please try again.');
        return;
      }

      // If audit response provided a dataAudit envelope
      const respData = resp.data;
      if (options?.audit && respData && (respData as any).dataAudit) {
        const audit = (respData as any).dataAudit;
        // Show a success message and log audit issues
        if (!audit.success) {
          showError('Unit created, but data audit found mismatches. Check console for details.');
          console.info('Data Audit Issues:', audit.issues);
        } else {
          showSuccess('Unit created and audit passed.');
        }
      } else {
        showSuccess('Unit created successfully!');
      }

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