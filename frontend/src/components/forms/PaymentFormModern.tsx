import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { FormField } from '../../components/ui/form-field';
import { useCreatePayment, useLeases, useTenants } from '../../hooks';
import type { RentPaymentInput, PaymentMethodValue } from '../../types/payment';
import { PaymentMethod } from '../../types/payment';

interface PaymentFormModernProps {
  initialData?: Partial<RentPaymentInput>;
  loading?: boolean;
}

const PaymentFormModern: React.FC<PaymentFormModernProps> = ({
  initialData,
  loading
}) => {
  const navigate = useNavigate();
  const { mutate: createPayment } = useCreatePayment();
  const { leases } = useLeases();
  const { tenants } = useTenants();

  const [formData, setFormData] = useState<RentPaymentInput>({
    leaseId: initialData?.leaseId || '',
    tenantId: initialData?.tenantId || '',
    amount: initialData?.amount || 0,
    dueDate: initialData?.dueDate || '',
    paidDate: initialData?.paidDate || '',
    paymentMethod: initialData?.paymentMethod,
    transactionId: initialData?.transactionId || '',
    lateFee: initialData?.lateFee || 0,
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof RentPaymentInput, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.leaseId) newErrors.leaseId = 'Lease is required';
    if (!formData.tenantId) newErrors.tenantId = 'Tenant is required';
    if (formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    if (formData.lateFee !== undefined && formData.lateFee < 0) newErrors.lateFee = 'Late fee cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createPayment(formData);
      navigate('/payments');
    } catch (err) {
      console.error('Failed to create payment:', err);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Details
            </CardTitle>
            <CardDescription>
              Select the lease and tenant for this payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Lease" required>
                <Select value={formData.leaseId} onValueChange={(value) => handleChange('leaseId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lease" />
                  </SelectTrigger>
                  <SelectContent>
                    {leases.map(lease => (
                      <SelectItem key={lease.id} value={lease.id}>
                        Lease {lease.id.substring(0, 8)} - ₹{lease.monthlyRent}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.leaseId && <p className="text-sm text-red-600 mt-1">{errors.leaseId}</p>}
              </FormField>

              <FormField label="Tenant" required>
                <Select value={formData.tenantId} onValueChange={(value) => handleChange('tenantId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map(tenant => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.firstName} {tenant.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tenantId && <p className="text-sm text-red-600 mt-1">{errors.tenantId}</p>}
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Payment Amount */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Amount
            </CardTitle>
            <CardDescription>
              Enter the payment amount and any late fees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Amount (₹)" required>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
                {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount}</p>}
              </FormField>

              <FormField label="Late Fee (₹)">
                <Input
                  type="number"
                  value={formData.lateFee}
                  onChange={(e) => handleChange('lateFee', Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
                {errors.lateFee && <p className="text-sm text-red-600 mt-1">{errors.lateFee}</p>}
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Payment Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Payment Dates
            </CardTitle>
            <CardDescription>
              Set the due date and payment date
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Due Date" required>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                />
                {errors.dueDate && <p className="text-sm text-red-600 mt-1">{errors.dueDate}</p>}
              </FormField>

              <FormField label="Paid Date">
                <Input
                  type="date"
                  value={formData.paidDate}
                  onChange={(e) => handleChange('paidDate', e.target.value)}
                />
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>
              Select the payment method and enter transaction details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Payment Method">
                <Select
                  value={formData.paymentMethod || ''}
                  onValueChange={(value) => handleChange('paymentMethod', value as PaymentMethodValue)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                    <SelectItem value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</SelectItem>
                    <SelectItem value={PaymentMethod.UPI}>UPI</SelectItem>
                    <SelectItem value={PaymentMethod.CHEQUE}>Cheque</SelectItem>
                    <SelectItem value={PaymentMethod.CARD}>Card</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Transaction ID">
                <Input
                  value={formData.transactionId}
                  onChange={(e) => handleChange('transactionId', e.target.value)}
                  placeholder="Enter transaction reference"
                />
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
            <CardDescription>
              Any additional notes or comments about this payment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField label="Notes">
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Additional notes or comments..."
                rows={3}
              />
            </FormField>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/payments')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Recording...' : 'Record Payment'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PaymentFormModern;