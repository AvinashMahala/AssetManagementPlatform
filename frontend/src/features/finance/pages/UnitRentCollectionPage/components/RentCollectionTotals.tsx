import React from 'react';
import { Zap, Droplet, Flame, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/componentDesignLibrary';
import { formatCurrency } from '@/utils/billingCalculations';
import type { RentCollectionTotals as TotalsType } from '../types';
import type { UnitUtility } from '@/features/units/types';

interface RentCollectionTotalsProps {
  totals: TotalsType;
  utilities: UnitUtility[];
}

export const RentCollectionTotals: React.FC<RentCollectionTotalsProps> = ({ totals, utilities }) => {
  return (
    <>
      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Base Rent</p>
              <p className="text-xl font-bold">{formatCurrency(totals.baseRent)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Utilities</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(totals.totalUtilityCharges)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Meter Charges</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(totals.totalMeterCharges)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Expenses</p>
              <p className="text-xl font-bold text-orange-600">{formatCurrency(totals.totalExpenses)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Due</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.totalAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Base Charges */}
      <Card>
        <CardHeader>
          <CardTitle>Base Charges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700">Monthly Rent</span>
            <span className="text-lg font-semibold">{formatCurrency(totals.baseRent)}</span>
          </div>
          {totals.maintenanceCharges > 0 && (
            <div className="flex justify-between items-center py-2 border-t">
              <span className="text-gray-700">Maintenance Charges</span>
              <span className="text-lg font-semibold">{formatCurrency(totals.maintenanceCharges)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configured Utilities */}
      {utilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Configured Utilities</span>
              <Badge variant="outline">{utilities.filter(u => u.isEnabled).length} active</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {utilities
              .filter(utility => utility.isEnabled)
              .map((utility) => (
                <div key={utility.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      utility.utilityType === 'electricity' ? 'bg-yellow-100' :
                      utility.utilityType === 'water' ? 'bg-blue-100' :
                      utility.utilityType === 'gas' ? 'bg-orange-100' : 'bg-gray-100'
                    }`}>
                      {utility.utilityType === 'electricity' && <Zap className="h-4 w-4 text-yellow-600" />}
                      {utility.utilityType === 'water' && <Droplet className="h-4 w-4 text-blue-600" />}
                      {utility.utilityType === 'gas' && <Flame className="h-4 w-4 text-orange-600" />}
                      {!['electricity', 'water', 'gas'].includes(utility.utilityType) && <Eye className="h-4 w-4 text-gray-600" />}
                    </div>
                    <div>
                      <p className="font-medium">{utility.utilityName}</p>
                      <p className="text-sm text-gray-600 capitalize">
                        {utility.billingMethod === 'fixed' ? 'Fixed Rate' : 'Meter-based'} • {utility.utilityType}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {utility.billingMethod === 'fixed' 
                        ? formatCurrency(utility.fixedAmount || 0)
                        : 'Meter-based'
                      }
                    </p>
                    {utility.billingMethod === 'fixed' && (
                      <p className="text-xs text-gray-500">Fixed charge</p>
                    )}
                    {utility.billingMethod === 'meter_based' && (
                      <p className="text-xs text-gray-500">Calculated from meter</p>
                    )}
                  </div>
                </div>
              ))}
            {utilities.filter(u => u.isEnabled).length === 0 && (
              <p className="text-center text-gray-500 py-4">No active utilities configured</p>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};
