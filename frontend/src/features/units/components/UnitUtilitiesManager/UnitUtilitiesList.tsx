import React from 'react';
import type { UnitUtility, UtilityTypeValue, UtilityBillingMethodValue } from '@/features/units/types';
import { UtilityBillingMethod } from '@/features/units/types';

interface UnitUtilitiesListProps {
  utilities: UnitUtility[];
  onEdit: (utility: UnitUtility) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, isEnabled: boolean) => void;
  deleting: boolean;
  toggling: boolean;
}

export const UnitUtilitiesList: React.FC<UnitUtilitiesListProps> = ({
  utilities,
  onEdit,
  onDelete,
  onToggle,
  deleting,
  toggling
}) => {
  const getUtilityTypeLabel = (type: UtilityTypeValue) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getBillingMethodLabel = (method: UtilityBillingMethodValue) => {
    return method === UtilityBillingMethod.FIXED ? 'Fixed Amount' : 'Meter Based';
  };

  if (utilities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No utilities configured for this unit.
      </div>
    );
  }

  return (
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
                onClick={() => onToggle(utility.id, !utility.isEnabled)}
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
                onClick={() => onEdit(utility)}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(utility.id)}
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
  );
};
