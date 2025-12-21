import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateTenant } from '@/features/tenants/hooks/useTenants';
import { useNotifications } from '@/contexts';
import TenantFormTabbed from '@/features/tenants/components/forms/TenantFormTabbed';
import type { TenantInput } from '@/features/tenants/types';

const TenantCreatePageTabbed: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: createTenant, loading } = useCreateTenant();
  const { showSuccess, showError } = useNotifications();

  const handleSubmit = async (data: TenantInput) => {
    try {
      // Normalize optional fields to avoid backend type issues
      const payload: TenantInput = {
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

      const response = await createTenant(payload);
      if (response.success && response.data) {
        // Navigate to the created tenant's detail page if id is present, else go back to list
        const newId = (response.data as any).id;
        showSuccess('Tenant created successfully!');
        navigate(newId ? `/tenants/${newId}` : '/tenants');
      } else {
        showError(response.error?.message || 'Failed to create tenant');
      }
    } catch (err) {
      console.error('Create tenant failed', err);
      showError('Failed to create tenant. Please try again.');
    }
  };

  return (
    <TenantFormTabbed
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
};

export default TenantCreatePageTabbed;