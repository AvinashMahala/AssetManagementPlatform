import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateTenant } from '../../hooks';
import TenantFormModern from '../../components/forms/TenantFormModern';
import type { TenantInput } from '../../types/tenant';

const TenantCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: createTenant, loading } = useCreateTenant();

  const handleSubmit = async (data: TenantInput) => {
    try {
      // Normalize optional fields to avoid backend type issues
      const payload: TenantInput = {
        ...data,
        dateOfBirth: data.dateOfBirth && data.dateOfBirth !== '' ? data.dateOfBirth : undefined,
        phone: data.phone && data.phone.trim() !== '' ? data.phone : undefined,
        alternatePhone: data.alternatePhone && data.alternatePhone.trim() !== '' ? data.alternatePhone : undefined,
      };

      const response = await createTenant(payload);
      if (response.success && response.data) {
        // Navigate to the created tenant's detail page if id is present, else go back to list
        const newId = (response.data as any).id;
        navigate(newId ? `/tenants/${newId}` : '/tenants');
      } else {
        alert('Failed to create tenant: ' + (response.error?.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Create tenant failed', err);
      alert('Failed to create tenant. Please try again.');
    }
  };

  return (
    <TenantFormModern
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
};

export default TenantCreatePage;
