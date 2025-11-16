import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTenant, useUpdateTenant } from '../../hooks';
import { Button } from '../../components/ui/button';
import { AppLayout } from '../../components/layout/AppLayout';
import TenantFormTabbed from '../../components/forms/TenantFormTabbed';
import type { TenantInput } from '../../types/tenant';

const TenantEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: tenant, loading: fetchLoading } = useTenant(id!);
  const { mutate: updateTenant, loading: updateLoading } = useUpdateTenant();

  const handleSubmit = async (data: TenantInput) => {
    if (!id) return;

    try {
      await updateTenant({ id, data });
      navigate('/tenants', {
        state: { message: 'Tenant updated successfully!' }
      });
    } catch (error) {
      console.error('Failed to update tenant:', error);
      throw error; // Re-throw to let the form handle it
    }
  };

  if (fetchLoading) {
    return (
      <AppLayout title="Edit Tenant">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tenant...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!tenant) {
    return (
      <AppLayout title="Edit Tenant">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tenant Not Found</h2>
            <p className="text-gray-600 mb-4">The tenant you're trying to edit doesn't exist or has been deleted.</p>
            <Button onClick={() => navigate('/tenants')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tenants
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Edit Tenant">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/tenants')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tenants
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Tenant</h1>
            <p className="mt-2 text-gray-600">Update tenant record details</p>
          </div>
        </div>

        <TenantFormTabbed
          initialData={tenant}
          onSubmit={handleSubmit}
          loading={updateLoading}
          isEdit={true}
        />
      </div>
    </AppLayout>
  );
};

export default TenantEditPage;
