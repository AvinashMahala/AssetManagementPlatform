import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLease, useUpdateLease, useUnits, useTenants } from '../../hooks';
import { useNotifications } from '../../contexts';
import type { LeaseInput } from '../../types/lease';

export const LeaseEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: lease, loading: loadingLease, error: loadError } = useLease(id!);
  const { mutate: updateLease, loading: updating, error: updateError } = useUpdateLease();
  const { units } = useUnits();
  const { tenants } = useTenants();
  const { showSuccess, showError } = useNotifications();

  const [formData, setFormData] = useState<LeaseInput>({
    unitId: '',
    tenantId: '',
    startDate: '',
    endDate: '',
    monthlyRent: 0,
    securityDeposit: 0,
    maintenanceCharges: 0,
    rentDueDay: 1,
    terms: '',
    specialConditions: '',
  });

  useEffect(() => {
    if (lease) {
      setFormData({
        unitId: lease.unitId,
        tenantId: lease.tenantId,
        startDate: lease.startDate.split('T')[0],
        endDate: lease.endDate.split('T')[0],
        monthlyRent: lease.monthlyRent,
        securityDeposit: lease.securityDeposit,
        maintenanceCharges: lease.maintenanceCharges,
        rentDueDay: lease.rentDueDay,
        terms: lease.terms,
        specialConditions: lease.specialConditions,
      });
    }
  }, [lease]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['monthlyRent', 'securityDeposit', 'maintenanceCharges', 'rentDueDay'].includes(name)
        ? Number(value)
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateLease({ id: id!, data: formData });
      showSuccess('Lease updated successfully!');
      navigate(`/leases/${id}`);
    } catch (err) {
      console.error('Failed to update lease:', err);
      showError('Failed to update lease. Please try again.');
    }
  };

  if (loadingLease) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading lease details...</div>
      </div>
    );
  }

  if (loadError || !lease) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{loadError || 'Lease not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Lease</h1>
        <p className="mt-2 text-gray-600">Update lease agreement details</p>
      </div>

      {updateError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{updateError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded-lg p-6">
        {/* Unit and Tenant Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="unitId" className="block text-sm font-medium text-gray-700">Unit *</label>
            <select id="unitId" name="unitId" value={formData.unitId} onChange={handleChange} required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="">Select a unit</option>
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>Unit {unit.unitNumber} - {unit.unitType.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700">Tenant *</label>
            <select id="tenantId" name="tenantId" value={formData.tenantId} onChange={handleChange} required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="">Select a tenant</option>
              {tenants.map(tenant => (
                <option key={tenant.id} value={tenant.id}>{tenant.firstName} {tenant.lastName} - {tenant.email}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lease Period */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date *</label>
            <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date *</label>
            <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="monthlyRent" className="block text-sm font-medium text-gray-700">Monthly Rent (₹) *</label>
            <input type="number" id="monthlyRent" name="monthlyRent" value={formData.monthlyRent} onChange={handleChange} required min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>

          <div>
            <label htmlFor="securityDeposit" className="block text-sm font-medium text-gray-700">Security Deposit (₹) *</label>
            <input type="number" id="securityDeposit" name="securityDeposit" value={formData.securityDeposit} onChange={handleChange} required min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>

          <div>
            <label htmlFor="maintenanceCharges" className="block text-sm font-medium text-gray-700">Maintenance (₹/month)</label>
            <input type="number" id="maintenanceCharges" name="maintenanceCharges" value={formData.maintenanceCharges} onChange={handleChange} min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
        </div>

        {/* Rent Due Day */}
        <div>
          <label htmlFor="rentDueDay" className="block text-sm font-medium text-gray-700">Rent Due Day (1-31) *</label>
          <input type="number" id="rentDueDay" name="rentDueDay" value={formData.rentDueDay} onChange={handleChange} required min="1" max="31"
            className="mt-1 block w-full md:w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          <p className="mt-1 text-sm text-gray-500">Day of the month when rent is due</p>
        </div>

        {/* Terms */}
        <div>
          <label htmlFor="terms" className="block text-sm font-medium text-gray-700">Lease Terms</label>
          <textarea id="terms" name="terms" value={formData.terms} onChange={handleChange} rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>

        {/* Special Conditions */}
        <div>
          <label htmlFor="specialConditions" className="block text-sm font-medium text-gray-700">Special Conditions</label>
          <textarea id="specialConditions" name="specialConditions" value={formData.specialConditions} onChange={handleChange} rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-end">
          <button type="button" onClick={() => navigate(`/leases/${id}`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={updating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
            {updating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
