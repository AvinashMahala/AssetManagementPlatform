import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import navigateBackOrFallback from '@/utils/navigation';
import { useCreateUnit } from '@/features/units/hooks/useUnits';
import { useNotifications } from '@/contexts';
import UnitFormTabbed from '@/features/units/components/forms/UnitFormTabbed';
import { AdminAuditModal } from '@/features/common/components/AdminAuditModal';
import type { UnitInput } from '@/features/units/types';
import './UnitCreatePage.module.scss';

export const UnitCreatePageTabbed: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutate: createUnit, loading } = useCreateUnit();
  const { showSuccess, showError } = useNotifications();

  const propertyId = searchParams.get('propertyId');

  const [auditOpen, setAuditOpen] = React.useState(false);
  const [auditData, setAuditData] = React.useState<any | null>(null);
  const [auditEntityId, setAuditEntityId] = React.useState<string | null>(null);

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
        const createdId = (respData as any).unit?.id || (respData as any).id || null;
        setAuditData(audit);
        setAuditEntityId(createdId);
        setAuditOpen(true);

        if (audit.success) {
          showSuccess('Unit created and audit passed.');
        } else {
          showError('Unit created, but data audit found mismatches.');
        }
      } else {
        showSuccess('Unit created successfully!');
      }

      // If the modal is not going to open, navigate back immediately
      if (!options?.audit || !(resp.data && (resp.data as any).dataAudit)) {
        navigateBackOrFallback(navigate, '/units');
      }
    } catch (error) {
      console.error('Failed to create unit:', error);
      showError('Failed to create unit. Please try again.');
    }
  };

  return (
    <>
      <UnitFormTabbed
        onSubmit={handleSubmit}
        loading={loading}
        initialData={propertyId ? { propertyId } : undefined}
      />

      <AdminAuditModal
        open={auditOpen}
        audit={auditData}
        onClose={() => {
          setAuditOpen(false);
          navigateBackOrFallback(navigate, '/units');
        }}
        onView={auditEntityId ? () => navigate(`/units/${auditEntityId}/edit`) : undefined}
      />
    </>
  );
};