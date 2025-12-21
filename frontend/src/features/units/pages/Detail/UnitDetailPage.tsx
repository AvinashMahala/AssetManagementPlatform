import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUnit, useDeleteUnit } from '@/features/units/hooks/useUnits';
import navigateBackOrFallback from '@/utils/navigation';
import { PhotoCarousel, PageLoadingSpinner } from '@/componentDesignLibrary';
import { UnitUtilitiesManager } from '@/features/units/components/UnitUtilitiesManager';
import { getErrorMessage } from '@/types/api';
import './UnitDetailPage.module.scss';

export const UnitDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: unit, loading, error } = useUnit(id!);
  const { mutate: deleteUnit, loading: deleting } = useDeleteUnit();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      try {
        await deleteUnit(id!);
        navigateBackOrFallback(navigate, '/units');
      } catch (err) {
        console.error('Failed to delete unit:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <PageLoadingSpinner text="Loading unit details..." />
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{getErrorMessage(error) || 'Unit not found'}</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      case 'under_maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'reserved': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Unit {unit.unitNumber}</h1>
          <p className="mt-2 text-gray-600">Floor {unit.floor || 'N/A'}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(unit.status)}`}>
          {unit.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {/* Photos */}
      {unit.unitPhotos && unit.unitPhotos.length > 0 && (
        <div className="mb-6">
          <PhotoCarousel
            photos={unit.unitPhotos}
            altPrefix={`Unit ${unit.unitNumber}`}
            className="mb-4"
          />
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Basic Details */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Unit Type</p>
              <p className="font-medium">{unit.unitType.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Furnished</p>
              <p className="font-medium">{unit.furnished ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bedrooms</p>
              <p className="font-medium">{unit.bedrooms || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bathrooms</p>
              <p className="font-medium">{unit.bathrooms || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Balconies</p>
              <p className="font-medium">{unit.balconies || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Area</p>
              <p className="font-medium">{unit.area} sq ft</p>
            </div>
            {unit.maxOccupants && (
              <div>
                <p className="text-sm text-gray-500">Max Occupants</p>
                <p className="font-medium">{unit.maxOccupants}</p>
              </div>
            )}
          </div>
        </div>

        {/* Financial Details */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-4">Financial Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Monthly Rent</p>
              <p className="text-lg font-semibold text-green-600">{formatCurrency(unit.monthlyRent)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Security Deposit</p>
              <p className="text-lg font-semibold">{formatCurrency(unit.securityDeposit)}</p>
            </div>
            {unit.maintenanceCharges && unit.maintenanceCharges > 0 && (
              <div>
                <p className="text-sm text-gray-500">Maintenance Charges</p>
                <p className="text-lg font-semibold">{formatCurrency(unit.maintenanceCharges)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Amenities */}
        {unit.unitAmenities && unit.unitAmenities.length > 0 && (
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-4">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {unit.unitAmenities.map((amenity, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {unit.description && (
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700">{unit.description}</p>
          </div>
        )}

        {/* Utilities */}
        <div className="p-6 border-b">
          <UnitUtilitiesManager unitId={unit.id} propertyId={unit.propertyId} />
        </div>

        {/* Metadata */}
        <div className="p-6 bg-gray-50">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="font-medium">Created</p>
              <p>{new Date(unit.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="font-medium">Last Updated</p>
              <p>{new Date(unit.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => navigateBackOrFallback(navigate, '/units')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Back to Units
        </button>
        <button
          onClick={() => navigate(`/units/${id}/dashboard`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          View Dashboard
        </button>
        <button
          onClick={() => navigate(`/units/${id}/edit`)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Edit Unit
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
        >
          {deleting ? 'Deleting...' : 'Delete Unit'}
        </button>
      </div>
    </div>
  );
};
