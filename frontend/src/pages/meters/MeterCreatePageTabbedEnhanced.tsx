import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { MeterCreatePageTabbed } from './MeterCreatePageTabbed';

const MeterCreatePageTabbedEnhanced: React.FC = () => {
  return (
    <AppLayout>
      <MeterCreatePageTabbed />
    </AppLayout>
  );
};

export default MeterCreatePageTabbedEnhanced;