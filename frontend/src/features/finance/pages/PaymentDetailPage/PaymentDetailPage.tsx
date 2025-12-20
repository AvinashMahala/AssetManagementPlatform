import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePayment, useDeletePayment, useLease, useTenant } from '../../../../hooks';
import navigateBackOrFallback from '../../../../utils/navigation';
import { ReceiptGenerator } from '@/features/finance/components/receipts/ReceiptGenerator';
import { getErrorMessage } from '../../../../types/api';

export const PaymentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: payment, loading, error } = usePayment(id!);
  const { mutate: deletePayment, loading: deleting } = useDeletePayment();
  
  const { data: lease } = useLease(payment?.leaseId || '');
  const { data: tenant } = useTenant(payment?.tenantId || '');

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      try {
        await deletePayment(id!);
        navigateBackOrFallback(navigate, '/payments');
      } catch (err) {
        console.error('Failed to delete payment:', err);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="text-gray-600">Loading payment details...</div></div>;
  }

  if (error || !payment) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{getErrorMessage(error) || 'Payment not found'}</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Details</h1>
          <p className="mt-2 text-gray-600">ID: {payment.id}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
          {payment.status.toUpperCase()}
        </span>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b bg-green-50">
          <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Tenant</p>
              <p className="font-medium">{tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Loading...'}</p>
              {tenant && <p className="text-sm text-gray-600">{tenant.email}</p>}
            </div>
            <div>
              <p className="text-sm text-gray-500">Lease</p>
              <p className="font-medium">{lease ? `₹${lease.monthlyRent}/month` : 'Loading...'}</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-4">Amount Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Payment Amount</p>
              <p className="text-lg font-semibold text-green-600">{formatCurrency(payment.amount)}</p>
            </div>
            {payment.lateFee && payment.lateFee > 0 && (
              <div>
                <p className="text-sm text-gray-500">Late Fee</p>
                <p className="text-lg font-semibold text-red-600">{formatCurrency(payment.lateFee)}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-lg font-semibold">{formatCurrency(payment.amount + (payment.lateFee || 0))}</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-4">Date Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Due Date</p>
              <p className="font-medium">{formatDate(payment.dueDate)}</p>
            </div>
            {payment.paidDate && (
              <div>
                <p className="text-sm text-gray-500">Paid Date</p>
                <p className="font-medium">{formatDate(payment.paidDate)}</p>
              </div>
            )}
          </div>
        </div>

        {(payment.paymentMethod || payment.transactionId) && (
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {payment.paymentMethod && (
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium">{payment.paymentMethod.replace('_', ' ').toUpperCase()}</p>
                </div>
              )}
              {payment.transactionId && (
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-medium">{payment.transactionId}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {payment.notes && (
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-4">Notes</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{payment.notes}</p>
          </div>
        )}

        {/* Receipt Generator - only show for paid payments */}
        {payment.status === 'paid' && tenant && (
          <div className="p-6 border-b">
            <ReceiptGenerator
              paymentId={payment.id}
              tenantName={`${tenant.firstName} ${tenant.lastName}`}
              amount={payment.amount}
              onReceiptGenerated={() => {
                // Could navigate to receipt detail page or show success message
              }}
            />
          </div>
        )}

        <div className="p-6 bg-gray-50">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="font-medium">Created</p>
              <p>{new Date(payment.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="font-medium">Last Updated</p>
              <p>{new Date(payment.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button onClick={() => navigateBackOrFallback(navigate, '/payments')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
          Back to Payments
        </button>
        <button onClick={() => navigate(`/payments/${id}/edit`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Edit Payment
        </button>
        <button onClick={handleDelete} disabled={deleting}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400">
          {deleting ? 'Deleting...' : 'Delete Payment'}
        </button>
      </div>
    </div>
  );
};
