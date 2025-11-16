import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import TenantCreatePageTabbed from './TenantCreatePageTabbed';

const TenantCreatePageTabbedEnhanced: React.FC = () => {
  return (
    <AppLayout>
      <div className="py-8">
        <TenantCreatePageTabbed />
      </div>
    </AppLayout>
  );
};

export default TenantCreatePageTabbedEnhanced;