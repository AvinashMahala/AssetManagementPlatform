import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { UnitCreatePage } from './UnitCreatePage';

const UnitCreatePageEnhanced: React.FC = () => {
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <UnitCreatePage />
      </div>
    </AppLayout>
  );
};

export default UnitCreatePageEnhanced;
