import React from 'react';
import type { UnitUtility, UtilityTypeValue, UtilityBillingMethodValue } from '@/features/units/types';
import { UtilityType, UtilityBillingMethod } from '@/features/units/types';

interface UnitUtilityFormProps {
  formData: Partial<UnitUtility>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<UnitUtility>>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  updating: boolean;
  availableMeters: any[] | undefined;
  meteredUtilityTypes: UtilityTypeValue[];
}

export const UnitUtilityForm: React.FC<UnitUtilityFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  updating,
  availableMeters,
  meteredUtilityTypes
}) => {
  const getUtilityTypeLabel = (type: UtilityTypeValue) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Edit Utility
        </h3>

        <form onSubmit={onSubmit} className="space-y-4">
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
          {meteredUtilityTypes.includes(formData.utilityType as any) && (
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
          {!meteredUtilityTypes.includes(formData.utilityType as any) && (
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

          {formData.billingMethod === UtilityBillingMethod.METER_BASED && meteredUtilityTypes.includes(formData.utilityType as any) && (
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
                  value={formData.billingMultiplier || ''}
                  onChange={(e) => setFormData({ ...formData, billingMultiplier: parseFloat(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1.0"
                  min="0.0001"
                  max="100.0"
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
              disabled={updating}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {updating ? 'Updating...' : 'Update'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
