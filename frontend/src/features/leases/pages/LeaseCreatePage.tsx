import React from 'react';
import { AppLayout } from '../../../components/layout/AppLayout';
import LeaseCreatePageTabbed from './LeaseCreatePageTabbed';

const LeaseCreatePageTabbedEnhanced: React.FC = () => {
  return (
    <AppLayout>
      <div className="py-8">
        <LeaseCreatePageTabbed />
      </div>
    </AppLayout>
  );
};

export default LeaseCreatePageTabbedEnhanced;