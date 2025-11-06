import React from 'react';
import { useCreateTenant } from '../../hooks';
import TenantFormModern from '../../components/forms/TenantFormModern';
import type { TenantInput } from '../../types/tenant';

const TenantCreatePage: React.FC = () => {
  const { mutate: createTenant, loading } = useCreateTenant();

  const handleSubmit = async (data: TenantInput) => {
    await createTenant(data);
  };

  return (
    <TenantFormModern
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
};

export default TenantCreatePage;
