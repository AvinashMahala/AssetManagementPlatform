import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { PaymentCreatePage } from './PaymentCreatePage';

const PaymentCreatePageEnhanced: React.FC = () => {
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <PaymentCreatePage />
      </div>
    </AppLayout>
  );
};

export default PaymentCreatePageEnhanced;
