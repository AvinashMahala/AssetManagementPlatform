import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useRecordPayment } from '@/hooks';
import { useNotifications } from '@/contexts';

export const useRecordPaymentForm = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: recordPayment, loading } = useRecordPayment();
  const { showSuccess, showError } = useNotifications();

  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    transactionId: '',
    paymentReference: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId) return;

    try {
      await recordPayment({
        transactionId,
        payment: {
          amount: parseFloat(paymentData.amount),
          paymentDate: paymentData.paymentDate,
          paymentMethod: paymentData.paymentMethod,
          transactionId: paymentData.transactionId || undefined,
          paymentReference: paymentData.paymentReference || undefined,
          notes: paymentData.notes || undefined
        }
      });

      showSuccess('Payment recorded successfully!');
      
      // Navigate back after a short delay to show success message
      setTimeout(() => {
        // Check if we came from a unit page
        const state = location.state as any;
        if (state?.fromUnitPage) {
          // Navigate back to unit collection page with refetch state
          const pathSegments = window.location.pathname.split('/');
          const unitIdIndex = pathSegments.findIndex(segment => segment === 'units');
          if (unitIdIndex !== -1 && pathSegments[unitIdIndex + 1]) {
            const unitId = pathSegments[unitIdIndex + 1];
            const propertyIdIndex = pathSegments.findIndex(segment => segment === 'properties');
            if (propertyIdIndex !== -1 && pathSegments[propertyIdIndex + 1]) {
              const propertyId = pathSegments[propertyIdIndex + 1];
              navigate(`/properties/${propertyId}/rent-collection/${unitId}`, { state: { refetchTransactions: true } });
              return;
            }
          }
        }
        
        // Default navigation to property collection page
        const pathSegments = window.location.pathname.split('/');
        const propertyIdIndex = pathSegments.findIndex(segment => segment === 'properties');
        if (propertyIdIndex !== -1 && pathSegments[propertyIdIndex + 1]) {
          const propertyId = pathSegments[propertyIdIndex + 1];
          navigate(`/properties/${propertyId}/rent-collection`, { state: { refetchTransactions: true } });
        } else {
          navigate(-1);
        }
      }, 1500);
    } catch (err) {
      showError('Failed to record payment. Please try again.');
      console.error('Payment recording error:', err);
    }
  };

  return {
    transactionId,
    paymentData,
    setPaymentData,
    handleSubmit,
    loading,
    navigate
  };
};
