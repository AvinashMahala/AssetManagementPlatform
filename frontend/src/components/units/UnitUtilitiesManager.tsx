import React, { useState, useEffect } from 'react';
import type { UnitUtility, UtilityTypeValue, UtilityBillingMethodValue } from '../../types/unit';
import { UtilityType, UtilityBillingMethod } from '../../types/unit';
import { useUnitUtilities, useCreateUnitUtility, useUpdateUnitUtility, useDeleteUnitUtility, useToggleUnitUtility } from '../../hooks';
import { useLastMeterReadings } from '../../hooks/useRentTransactions';
import { getErrorMessage } from '../../types/api';

interface UnitUtilitiesManagerProps {
  unitId: string;
  propertyId: string;
}

export const UnitUtilitiesManager: React.FC<UnitUtilitiesManagerProps> = ({ unitId, propertyId }) => {
  const { utilities, loading, error, refetch } = useUnitUtilities(unitId);
  const { loading: readingsLoading } = useLastMeterReadings(unitId);
  const { mutate: createUtility, loading: creating } = useCreateUnitUtility();
  const { mutate: updateUtility, loading: updating } = useUpdateUnitUtility();
  const { mutate: deleteUtility, loading: deleting } = useDeleteUnitUtility();
  const { mutate: toggleUtility, loading: toggling } = useToggleUnitUtility();

  // Define which utility types support meter-based billing
  const METERED_UTILITY_TYPES = [UtilityType.ELECTRICITY, UtilityType.WATER, UtilityType.GAS];

  const [showForm, setShowForm] = useState(false);
  const [editingUtility, setEditingUtility] = useState<UnitUtility | null>(null);
  const [formData, setFormData] = useState<Partial<UnitUtility>>({
    utilityType: UtilityType.ELECTRICITY,
    utilityName: '',
    billingMethod: UtilityBillingMethod.FIXED,
    isEnabled: true,
  });

  // Get available meters for auto-resolution
  const { data: availableMeters } = useLastMeterReadings(unitId);

  // Auto-set billing method and resolve meter ID when utility type changes
  useEffect(() => {
    const isMeteredType = METERED_UTILITY_TYPES.includes(formData.utilityType as any);
    const newBillingMethod = isMeteredType ? UtilityBillingMethod.METER_BASED : UtilityBillingMethod.FIXED;
    
    setFormData(prev => ({
      ...prev,
      billingMethod: newBillingMethod,
      // Clear meter-related fields for non-metered utilities
      ...(newBillingMethod === UtilityBillingMethod.FIXED && {
        meterId: undefined,
        multiplier: undefined
      })
    }));

    // Auto-resolve meter ID for metered utilities
    if (isMeteredType && availableMeters && formData.utilityType) {
      const matchingMeter = availableMeters.find(meter => 
        meter.meterType.toLowerCase() === formData.utilityType?.toLowerCase()
      );
      
      if (matchingMeter && (!formData.meterId || editingUtility)) {
        setFormData(prev => ({
          ...prev,
          meterId: matchingMeter.meterId,
          multiplier: prev.multiplier || 1.0 // Default multiplier
        }));
      }
    }
  }, [formData.utilityType, availableMeters, editingUtility]);

  const resetForm = () => {
    setFormData({
      utilityType: UtilityType.ELECTRICITY,
      utilityName: '',
      billingMethod: UtilityBillingMethod.METER_BASED, // Default for electricity
      isEnabled: true,
    });
    setEditingUtility(null);
    setShowForm(false);
  };

  const handleCreate = () => {
    setEditingUtility(null);
    // Start with electricity (metered) as default
    const defaultType = UtilityType.ELECTRICITY;
    const isMeteredType = METERED_UTILITY_TYPES.includes(defaultType);
    
    setFormData({
      unitId,
      propertyId,
      utilityType: defaultType,
      utilityName: '',
      billingMethod: isMeteredType ? UtilityBillingMethod.METER_BASED : UtilityBillingMethod.FIXED,
      isEnabled: true,
    });
    setShowForm(true);
  };

  const handleEdit = (utility: UnitUtility) => {
    setEditingUtility(utility);
    setFormData({ ...utility });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        unitId,
        propertyId,
      } as any;

      if (editingUtility) {
        await updateUtility({ id: editingUtility.id, data });
      } else {
        await createUtility(data);
      }

      resetForm();
      refetch();
    } catch (err) {
      console.error('Failed to save utility:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this utility?')) {
      try {
        await deleteUtility(id);
        refetch();
      } catch (err) {
        console.error('Failed to delete utility:', err);
      }
    }
  };

  const handleToggle = async (id: string, isEnabled: boolean) => {
    try {
      await toggleUtility({ id, isEnabled });
      refetch();
    } catch (err) {
      console.error('Failed to toggle utility:', err);
    }
  };

  const getUtilityTypeLabel = (type: UtilityTypeValue) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getBillingMethodLabel = (method: UtilityBillingMethodValue) => {
    return method === UtilityBillingMethod.FIXED ? 'Fixed Amount' : 'Meter Based';
  };

  if (loading || readingsLoading) {
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
          Add Utility
        </button>
      </div>

      {/* Utilities List */}
      {utilities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No utilities configured for this unit.
        </div>
      ) : (
        <div className="space-y-4">
          {utilities.map((utility) => (
            <div key={utility.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-gray-900">{utility.utilityName}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      utility.isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {utility.isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                    <span>Type: {getUtilityTypeLabel(utility.utilityType)}</span>
                    <span>Method: {getBillingMethodLabel(utility.billingMethod)}</span>
                    {utility.billingMethod === UtilityBillingMethod.FIXED && utility.fixedAmount && (
                      <span>Amount: ₹{utility.fixedAmount}</span>
                    )}
                    {utility.billingMethod === UtilityBillingMethod.METER_BASED && utility.multiplier && (
                      <span>Multiplier: {utility.multiplier}x</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(utility.id, !utility.isEnabled)}
                    disabled={toggling}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      utility.isEnabled
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {utility.isEnabled ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleEdit(utility)}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(utility.id)}
                    disabled={deleting}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-medium hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingUtility ? 'Edit Utility' : 'Add Utility'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Utility Type
                </label>
                <select
                  value={formData.utilityType}
                  onChange={(e) => setFormData({ ...formData, utilityType: e.target.value as UtilityTypeValue })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {Object.values(UtilityType).map((type) => (
                    <option key={type} value={type}>
                      {getUtilityTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Utility Name
                </label>
                <input
                  type="text"
                  value={formData.utilityName || ''}
                  onChange={(e) => setFormData({ ...formData, utilityName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Electricity, Water Supply"
                  required
                />
              </div>

              {/* Billing Method - Only show for metered utilities */}
              {METERED_UTILITY_TYPES.includes(formData.utilityType as any) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Method
                  </label>
                  <select
                    value={formData.billingMethod}
                    onChange={(e) => setFormData({ ...formData, billingMethod: e.target.value as UtilityBillingMethodValue })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={UtilityBillingMethod.FIXED}>Fixed Amount</option>
                    <option value={UtilityBillingMethod.METER_BASED}>Meter Based</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 {formData.utilityType} supports both fixed and meter-based billing
                  </p>
                </div>
              )}

              {/* Fixed billing info for non-metered utilities */}
              {!METERED_UTILITY_TYPES.includes(formData.utilityType as any) && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Fixed Billing:</span> {getUtilityTypeLabel(formData.utilityType as any)} utilities use fixed monthly charges only.
                  </p>
                </div>
              )}

              {formData.billingMethod === UtilityBillingMethod.FIXED && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fixed Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.fixedAmount || ''}
                    onChange={(e) => setFormData({ ...formData, fixedAmount: parseFloat(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              )}

              {formData.billingMethod === UtilityBillingMethod.METER_BASED && METERED_UTILITY_TYPES.includes(formData.utilityType as any) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meter ID
                      {formData.meterId && (
                        <span className="ml-2 text-xs text-green-600 font-normal">
                          ✓ Auto-resolved from {formData.utilityType} meter
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={formData.meterId || ''}
                      onChange={(e) => setFormData({ ...formData, meterId: e.target.value })}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formData.meterId ? 'bg-green-50 border-green-300' : ''
                      }`}
                      placeholder={availableMeters ? "Select utility type to auto-resolve meter" : "Loading meters..."}
                      required
                    />
                    {availableMeters && !formData.meterId && (
                      <p className="text-xs text-gray-500 mt-1">
                        No {formData.utilityType?.toLowerCase()} meter found. Please add a meter first or enter manually.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Multiplier
                    </label>
                    <input
                      type="number"
                      value={formData.multiplier || ''}
                      onChange={(e) => setFormData({ ...formData, multiplier: parseFloat(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1.0"
                      min="0.1"
                      max="10.0"
                      step="0.1"
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isEnabled"
                  checked={formData.isEnabled || false}
                  onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isEnabled" className="ml-2 text-sm text-gray-700">
                  Enable this utility
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {creating || updating ? 'Saving...' : (editingUtility ? 'Update' : 'Create')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};