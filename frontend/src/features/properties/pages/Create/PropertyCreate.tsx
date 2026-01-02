import React from 'react';
import { useCreateProperty } from '@/features/properties/hooks/useProperties';
import { useNavigate } from 'react-router-dom';
import navigateBackOrFallback from '@/utils/navigation';
import PropertyFormTabbed from '@/features/properties/components/forms/PropertyFormTabbed';
import { AdminAuditModal } from '@/features/common/components/AdminAuditModal';
import { AppLayout } from '@/components/layout/AppLayout';
import type { PropertyInput } from '@/features/properties/types';

  const [auditOpen, setAuditOpen] = React.useState(false);
  const [auditData, setAuditData] = React.useState<any | null>(null);
  const [createdId, setCreatedId] = React.useState<string | null>(null);

const PropertyCreate: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: createProperty, loading, error } = useCreateProperty();

  const handleSubmit = async (data: PropertyInput, options?: { audit?: boolean }) => {
    try {
      const resp = await createProperty({ data, audit: options?.audit });

      if (!resp.success) {
        if (resp.error && String(resp.error.code).toUpperCase() === 'DUPLICATE_PROPERTY') {
          // Show an error and prevent navigation
          throw new Error(resp.error.message || 'Duplicate property exists.');
        }
        throw new Error(resp.error?.message || 'Failed to create property');
      }

      const respData = resp.data;
      if (options?.audit && respData && (respData as any).dataAudit) {
        const audit = (respData as any).dataAudit;
        const created = (respData as any).property || (respData as any).data;
        const createdId = created?.id ?? null;
        if (!audit.success) {
          setAuditData(audit);
          setCreatedId(createdId);
          setAuditOpen(true);
          return;
        }
      }

      // Default navigation behavior
      if (resp.success && resp.data?.id) {
        navigate(`/properties/${resp.data.id}/edit`);
      } else if ((resp.data as any)?.property?.id) {
        navigate(`/properties/${(resp.data as any).property.id}/edit`);
      } else {
        navigateBackOrFallback(navigate, '/properties');
      }
    } catch (error) {
      console.error('Failed to create property:', error);
      throw error; // Re-throw to let the form handle it
    }
  };

  return (
    <AppLayout>
      <div className="py-8">
        <PropertyFormTabbed
          onSubmit={handleSubmit}
          loading={loading}
          apiError={error}
        />
      </div>

      <AdminAuditModal
        open={auditOpen}
        audit={auditData}
        onClose={() => setAuditOpen(false)}
        onView={createdId ? () => navigate(`/properties/${createdId}/edit`) : undefined}
      />
    </AppLayout>
  );
};

export default PropertyCreate;