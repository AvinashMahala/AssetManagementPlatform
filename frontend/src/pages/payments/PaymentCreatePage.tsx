import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatePayment, useLeases, useTenants } from '../../hooks';
import type { RentPaymentInput } from '../../types/payment';
import { PaymentMethod } from '../../types/payment';

export const PaymentCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: createPayment, loading, error } = useCreatePayment();
  const { leases } = useLeases();
  const { tenants } = useTenants();
  
  const [formData, setFormData] = useState<RentPaymentInput>({
    leaseId: '',
    tenantId: '',
    amount: 0,
    dueDate: '',
    paidDate: '',
    paymentMethod: undefined,
    transactionId: '',
    lateFee: 0,
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['amount', 'lateFee'].includes(name) ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPayment(formData);
      navigate('/payments');
    } catch (err) {
      console.error('Failed to create payment:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Record New Payment</h1>
        <p className="mt-2 text-gray-600">Add a new rent payment record</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded-lg p-6">
        {/* Lease and Tenant */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="leaseId" className="block text-sm font-medium text-gray-700">Lease *</label>
            <select id="leaseId" name="leaseId" value={formData.leaseId} onChange={handleChange} required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="">Select a lease</option>
              {leases.map(lease => (
                <option key={lease.id} value={lease.id}>
                  Lease {lease.id.substring(0, 8)} - ₹{lease.monthlyRent}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700">Tenant *</label>
            <select id="tenantId" name="tenantId" value={formData.tenantId} onChange={handleChange} required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="">Select a tenant</option>
              {tenants.map(tenant => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.firstName} {tenant.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount and Late Fee */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (₹) *</label>
            <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleChange} required min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>

          <div>
            <label htmlFor="lateFee" className="block text-sm font-medium text-gray-700">Late Fee (₹)</label>
            <input type="number" id="lateFee" name="lateFee" value={formData.lateFee} onChange={handleChange} min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
        </div>

        {/* Due Date and Paid Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date *</label>
            <input type="date" id="dueDate" name="dueDate" value={formData.dueDate} onChange={handleChange} required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>

          <div>
            <label htmlFor="paidDate" className="block text-sm font-medium text-gray-700">Paid Date</label>
            <input type="date" id="paidDate" name="paidDate" value={formData.paidDate} onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
        </div>

        {/* Payment Method and Transaction ID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</label>
            <select id="paymentMethod" name="paymentMethod" value={formData.paymentMethod || ''} onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="">Select method</option>
              <option value={PaymentMethod.CASH}>Cash</option>
              <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</option>
              <option value={PaymentMethod.UPI}>UPI</option>
              <option value={PaymentMethod.CHEQUE}>Cheque</option>
              <option value={PaymentMethod.CARD}>Card</option>
            </select>
          </div>

          <div>
            <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700">Transaction ID</label>
            <input type="text" id="transactionId" name="transactionId" value={formData.transactionId} onChange={handleChange}
              placeholder="Enter transaction reference"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3}
            placeholder="Additional notes or comments..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-end">
          <button type="button" onClick={() => navigate('/payments')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
            {loading ? 'Creating...' : 'Create Payment'}
          </button>
        </div>
      </form>
    </div>
  );
};
