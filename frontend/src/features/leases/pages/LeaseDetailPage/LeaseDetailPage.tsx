import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/componentDesignLibrary';
import { useLease, useDeleteLease } from '@/features/leases/hooks/useLeases';
import { useUnit } from '@/features/units/hooks/useUnits';
import { useTenant } from '@/features/tenants/hooks/useTenants';
import { useProperty } from '@/features/properties/hooks/useProperties';
import navigateBackOrFallback from '@/utils/navigation';
import { getErrorMessage } from '@/types/api';

export const LeaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: lease, loading, error } = useLease(id!);
  const { mutate: deleteLease, loading: deleting } = useDeleteLease();
  
  // Get unit, tenant, and property details - only when lease data is available and IDs are valid
  const hasValidUnitId = lease?.unitId && lease.unitId.trim().length > 0;
  const hasValidTenantId = lease?.tenantId && lease.tenantId.trim().length > 0;
  const hasValidPropertyId = lease?.propertyId && lease.propertyId.trim().length > 0;

  const { data: unit } = useUnit(hasValidUnitId ? lease.unitId : undefined);
  const { data: tenant } = useTenant(hasValidTenantId ? lease.tenantId : undefined);
  const { data: property } = useProperty(hasValidPropertyId ? lease.propertyId : undefined);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this lease?')) {
      try {
        await deleteLease(id!);
        navigateBackOrFallback(navigate, '/leases');
      } catch (err) {
        console.error('Failed to delete lease:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading lease details...</div>
      </div>
    );
  }

  if (error || !lease) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{getErrorMessage(error) || 'Lease not found'}</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

    // Helper function to format address
  const formatAddress = (address: any) => {
    if (!address) return '';
    const parts = [
      address.street,
      address.landmark,
      address.city,
      address.state,
      address.pincode,
      address.country
    ].filter(Boolean);
    return parts.join(', ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const calculateDuration = () => {
    const start = new Date(lease.startDate);
    const end = new Date(lease.endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return `${months} months`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lease Agreement</h1>
          <p className="mt-2 text-gray-600">ID: {lease.id}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lease.status || 'draft')}`}>
          {(lease.status || 'draft').toUpperCase()}
        </span>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Unit and Tenant Details */}
        <div className="p-6 border-b bg-blue-50">
          <h2 className="text-xl font-semibold mb-4">Lease Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Property</p>
              <p className="font-medium">
                {property ? property.name || 'Unknown Property' : 'Loading...'}
              </p>
              {property && property.address && <p className="text-sm text-gray-600">{formatAddress(property.address)}</p>}
            </div>
            <div>
              <p className="text-sm text-gray-500">Unit</p>
              <p className="font-medium">
                {unit ? `Unit ${unit.unitNumber || 'Unknown'} - ${(unit.unitType || 'Unknown').toUpperCase()}` : 'Loading...'}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Tenant</p>
              <p className="font-medium">
                {tenant ? `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim() || 'Unknown Tenant' : 'Loading...'}
              </p>
              {tenant && tenant.email && <p className="text-sm text-gray-600">{tenant.email}</p>}
            </div>
          </div>
        </div>

        {/* Lease Period */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-4">Lease Period</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-medium">{formatDate(lease.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Date</p>
              <p className="font-medium">{formatDate(lease.endDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium">{calculateDuration()}</p>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-4">Financial Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Monthly Rent</p>
              <p className="text-lg font-semibold text-green-600">{formatCurrency(lease.monthlyRent)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Security Deposit</p>
              <p className="text-lg font-semibold">{formatCurrency(lease.securityDeposit)}</p>
            </div>
            {lease.maintenanceCharges && lease.maintenanceCharges > 0 && (
              <div>
                <p className="text-sm text-gray-500">Maintenance Charges</p>
                <p className="text-lg font-semibold">{formatCurrency(lease.maintenanceCharges)}</p>
              </div>
            )}
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Rent Due Day</p>
            <p className="font-medium">{lease.rentDueDay || 'Not specified'} of every month</p>
          </div>
        </div>

        {/* Terms */}
                {lease.termsConditions && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Terms & Conditions</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{lease.termsConditions}</p>
          </Card>
        )}

        {/* Special Conditions */}
        {lease.specialConditions && (
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-4">Special Conditions</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{lease.specialConditions}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="p-6 bg-gray-50">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="font-medium">Created</p>
              <p>{new Date(lease.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="font-medium">Last Updated</p>
              <p>{new Date(lease.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => navigateBackOrFallback(navigate, '/leases')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Back to Leases
        </button>
        <button
          onClick={() => navigate(`/leases/${id}/edit`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Edit Lease
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
        >
          {deleting ? 'Deleting...' : 'Delete Lease'}
        </button>
      </div>
    </div>
  );
};
