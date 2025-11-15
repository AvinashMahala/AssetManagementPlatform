import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTenant, useUpdateTenant } from '../../hooks';
import { useNotifications } from '../../contexts';
import TenantFormTabbed from '../../components/forms/TenantFormTabbed';
import type { TenantInput } from '../../types/tenant';

const TenantEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: tenant, loading: fetchLoading } = useTenant(id!);
  const { mutate: updateTenant, loading: updateLoading } = useUpdateTenant();
  const { showSuccess, showError } = useNotifications();

  const handleSubmit = async (data: TenantInput) => {
    try {
      // Normalize optional fields to avoid backend type issues
      const payload: Partial<TenantInput> = {
        ...data,
        dateOfBirth: data.dateOfBirth && data.dateOfBirth !== '' ? data.dateOfBirth : undefined,
        phone: data.phone && data.phone.trim() !== '' ? data.phone.trim() : undefined,
        alternatePhone: data.alternatePhone && data.alternatePhone.trim() !== '' ? data.alternatePhone.trim() : undefined,
        occupation: data.occupation && data.occupation.trim() !== '' ? data.occupation : undefined,
        companyName: data.companyName && data.companyName.trim() !== '' ? data.companyName : undefined,
        monthlyIncome: data.monthlyIncome !== undefined && data.monthlyIncome >= 0 ? data.monthlyIncome : undefined,
        // Remove permanentAddress if not provided
        permanentAddress: data.permanentAddress && 
          data.permanentAddress.street && 
          data.permanentAddress.city && 
          data.permanentAddress.state && 
          data.permanentAddress.pincode 
          ? data.permanentAddress 
          : undefined,
        // Remove emergencyContact if not provided
        emergencyContact: data.emergencyContact && 
          data.emergencyContact.name && 
          data.emergencyContact.relationship && 
          data.emergencyContact.phone 
          ? data.emergencyContact 
          : undefined,
      };

      const response = await updateTenant({ id: id!, data: payload });
      if (response.success) {
        showSuccess('Tenant updated successfully!');
        navigate(`/tenants/${id}`);
      } else {
        showError(response.error?.message || 'Failed to update tenant');
      }
    } catch (error) {
      console.error('Error updating tenant:', error);
      showError('Failed to update tenant. Please try again.');
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Tenant Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <TenantFormTabbed
        initialData={tenant}
        onSubmit={handleSubmit}
        loading={updateLoading}
        isEdit={true}
        tenantId={id}
      />
    </div>
  );
};

export default TenantEditPage;
