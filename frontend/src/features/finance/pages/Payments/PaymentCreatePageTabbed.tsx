import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatePayment } from '../../../../hooks';
import { useNotifications } from '../../../../contexts';
import PaymentFormTabbed from '../../../../components/forms/PaymentFormTabbed';
import type { RentPaymentInput } from '../../../../types/payment';

const PaymentCreatePageTabbed: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: createPayment, loading } = useCreatePayment();
  const { showSuccess, showError } = useNotifications();

  const handleSubmit = async (data: RentPaymentInput) => {
    try {
      const response = await createPayment(data);
      if (response.success && response.data) {
        // Navigate to the created payment's detail page if id is present, else go back to list
        const newId = (response.data as any).id;
        showSuccess('Payment recorded successfully!');
        navigate(newId ? `/payments/${newId}` : '/payments');
      } else {
        showError(response.error?.message || 'Failed to record payment');
      }
    } catch (err) {
      console.error('Create payment failed', err);
      showError('Failed to record payment. Please try again.');
    }
  };

  return (
    <PaymentFormTabbed
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
};

export default PaymentCreatePageTabbed;