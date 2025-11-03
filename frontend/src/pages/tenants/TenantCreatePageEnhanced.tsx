import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import TenantCreatePage from './TenantCreatePage';

const TenantCreatePageEnhanced: React.FC = () => {
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <TenantCreatePage />
      </div>
    </AppLayout>
  );
};

export default TenantCreatePageEnhanced;
