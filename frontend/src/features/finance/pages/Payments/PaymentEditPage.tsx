import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import navigateBackOrFallback from '../../../../utils/navigation';
import { ArrowLeft } from 'lucide-react';
import { usePayment, useUpdatePayment } from '../../../../hooks';
import { Button } from '@/componentDesignLibrary';
import { AppLayout } from '../../../../components/layout/AppLayout';
import PaymentFormTabbed from '../../../../components/forms/PaymentFormTabbed';
import type { RentPaymentInput } from '../../../../types/payment';

export const PaymentEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: payment, loading: loadingPayment, error: paymentError } = usePayment(id!);
  const { mutate: updatePayment, loading: updating } = useUpdatePayment();

  const handleSubmit = async (data: RentPaymentInput) => {
    if (!id) return;

    try {
      await updatePayment({ id, data });
      navigateBackOrFallback(navigate, '/payments', { state: { message: 'Payment updated successfully!' } });
    } catch (error) {
      console.error('Failed to update payment:', error);
      throw error; // Re-throw to let the form handle it
    }
  };

  if (loadingPayment) {
    return (
      <AppLayout title="Edit Payment">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payment...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (paymentError || !payment) {
    return (
      <AppLayout title="Edit Payment">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Not Found</h2>
            <p className="text-gray-600 mb-4">The payment you're trying to edit doesn't exist or has been deleted.</p>
            <Button onClick={() => navigateBackOrFallback(navigate, '/payments')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Payments
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Edit Payment">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigateBackOrFallback(navigate, '/payments')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payments
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Payment</h1>
            <p className="mt-2 text-gray-600">Update payment record details</p>
          </div>
        </div>

        <PaymentFormTabbed
          initialData={payment}
          onSubmit={handleSubmit}
          loading={updating}
          isEdit={true}
        />
      </div>
    </AppLayout>
  );
};
