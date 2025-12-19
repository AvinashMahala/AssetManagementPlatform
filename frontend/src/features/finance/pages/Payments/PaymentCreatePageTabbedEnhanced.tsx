import React from 'react';
import { AppLayout } from '../../../../components/layout/AppLayout';
import PaymentCreatePageTabbed from './PaymentCreatePageTabbed';

const PaymentCreatePageTabbedEnhanced: React.FC = () => {
  return (
    <AppLayout>
      <div className="py-8">
        <PaymentCreatePageTabbed />
      </div>
    </AppLayout>
  );
};

export default PaymentCreatePageTabbedEnhanced;