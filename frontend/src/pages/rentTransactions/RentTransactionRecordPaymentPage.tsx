import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, DollarSign, CreditCard, Banknote } from 'lucide-react';
import { Button } from '@/componentDesignLibrary';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import { Input } from '@/componentDesignLibrary';
import { Label } from '@/componentDesignLibrary';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/componentDesignLibrary';
import { AppLayout } from '../../components/layout';
import { useRecordPayment } from '../../hooks';
import { useNotifications } from '../../contexts';

export const RentTransactionRecordPaymentPage: React.FC = () => {
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

  return (
    <AppLayout title="Record Payment">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Record Payment</h1>
            <p className="text-gray-600">Transaction ID: {transactionId}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Payment Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Payment Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="paymentDate">Payment Date</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={paymentData.paymentDate}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, paymentDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={paymentData.paymentMethod}
                  onValueChange={(value) => setPaymentData(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <div className="flex items-center space-x-2">
                        <Banknote className="h-4 w-4" />
                        <span>Cash</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="bank_transfer">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Bank Transfer</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="check">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Check</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="credit_card">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Credit Card</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="online">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Online Payment</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="transactionId">Transaction/Reference ID</Label>
                <Input
                  id="transactionId"
                  placeholder="Bank transaction ID, check number, etc."
                  value={paymentData.transactionId}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, transactionId: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="paymentReference">Payment Reference</Label>
                <Input
                  id="paymentReference"
                  placeholder="Additional reference information"
                  value={paymentData.paymentReference}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, paymentReference: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes about this payment"
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Recording...' : 'Record Payment'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};