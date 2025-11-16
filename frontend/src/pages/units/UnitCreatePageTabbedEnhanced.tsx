import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { UnitCreatePageTabbed } from './UnitCreatePageTabbed';

const UnitCreatePageTabbedEnhanced: React.FC = () => {
  return (
    <AppLayout>
      <UnitCreatePageTabbed />
    </AppLayout>
  );
};

export default UnitCreatePageTabbedEnhanced;