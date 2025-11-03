import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { LeaseCreatePage } from './LeaseCreatePage';

const LeaseCreatePageEnhanced: React.FC = () => {
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <LeaseCreatePage />
      </div>
    </AppLayout>
  );
};

export default LeaseCreatePageEnhanced;
