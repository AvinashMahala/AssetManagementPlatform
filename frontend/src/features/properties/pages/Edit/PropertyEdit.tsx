import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProperty, useUpdateProperty } from '@/features/properties/hooks/useProperties';
import navigateBackOrFallback from '@/utils/navigation';
import PropertyFormTabbed from '@/features/properties/components/forms/PropertyFormTabbed';
import { AdminAuditModal } from '@/features/common/components/AdminAuditModal';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/componentDesignLibrary';
import type { PropertyInput } from '@/features/properties/types';
import { useNotifications } from '@/contexts/NotificationContext';

const PropertyEdit: React.FC = () => {
  const [auditOpen, setAuditOpen] = React.useState(false);
  const [auditData, setAuditData] = React.useState<any | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: property, loading: fetchLoading } = useProperty(id!);
  const { mutate: updateProperty, loading: updateLoading, error: updateError } = useUpdateProperty();
  const { showSuccess, showError } = useNotifications();

  const handleSubmit = async (data: PropertyInput, options?: { audit?: boolean }) => {
    if (!id) {
      return;
    }

    try {
      const resp = await updateProperty({ id, data, audit: options?.audit });

      if (!resp.success) {
        if (resp.error && String(resp.error.code).toUpperCase() === 'DUPLICATE_PROPERTY') {
          showError('Duplicate property exists. Please change identifiers.');
          return;
        }
        showError(resp.error?.message || 'Failed to update property');
        return;
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

      // Success
      showSuccess('Property updated', 'Property updated successfully');
      navigate(`/properties/${id}/dashboard`);
    } catch (error: any) {
      console.error('Failed to update property:', error);
      showError('Update failed', error?.message || 'Failed to update property');
    }
  };

  if (fetchLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (!property) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="text-center py-10">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                  Property Not Found
                </h3>
                <p className="text-muted-foreground mb-4">
                  The property you're trying to edit could not be found.
                </p>
                <button
                  onClick={() => navigateBackOrFallback(navigate, '/properties')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Back to Properties
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="py-8">
        <PropertyFormTabbed
          initialData={property}
          onSubmit={handleSubmit}
          loading={updateLoading}
          isEdit={true}
          propertyName={property?.name}
          propertyId={id}
          apiError={updateError}
        />

        <AdminAuditModal
          open={auditOpen}
          audit={auditData}
          onClose={() => {
            setAuditOpen(false);
            showError('Property updated with audit mismatches (check logs)');
            navigate(`/properties/${id}/dashboard`);
          }}
        />
      </div>
    </AppLayout>
  );
};

export default PropertyEdit;