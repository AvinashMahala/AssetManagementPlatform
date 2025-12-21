import React from 'react';
import { getErrorMessage } from '@/types/api';
import type { UnitUtilitiesManagerProps } from './UnitUtilitiesManager.types';
import { useUnitUtilitiesManager } from './useUnitUtilitiesManager';
import { UnitUtilitiesList } from './UnitUtilitiesList';
import { UnitUtilityForm } from './UnitUtilityForm';

export const UnitUtilitiesManager: React.FC<UnitUtilitiesManagerProps> = ({ unitId, propertyId }) => {
  const {
    utilities,
    loading,
    error,
    updating,
    deleting,
    toggling,
    showForm,
    formData,
    setFormData,
    availableMeters,
    METERED_UTILITY_TYPES,
    handleCreate,
    handleEdit,
    handleSubmit,
    handleDelete,
    handleToggle,
    resetForm
  } = useUnitUtilitiesManager(unitId, propertyId);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-gray-600">Loading utilities and meters...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error loading utilities: {getErrorMessage(error)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Unit Utilities</h3>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          Add Meter
        </button>
      </div>

      {/* Utilities List */}
      <UnitUtilitiesList
        utilities={utilities}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
        deleting={deleting}
        toggling={toggling}
      />

      {/* Add/Edit Form Modal */}
      {showForm && (
        <UnitUtilityForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          updating={updating}
          availableMeters={availableMeters || undefined}
          meteredUtilityTypes={METERED_UTILITY_TYPES}
        />
      )}
    </div>
  );
};
