import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';

interface MeterReadingPreviewProps {
  unitsConsumed: number;
  consumptionCost: number;
  totalCost: number;
  costPerUnit: number;
  fixedCharge: number;
}

export const MeterReadingPreview: React.FC<MeterReadingPreviewProps> = ({
  unitsConsumed,
  consumptionCost,
  totalCost,
  costPerUnit,
  fixedCharge,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculation Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{unitsConsumed.toFixed(2)}</div>
            <div className="text-sm text-blue-600">Units Consumed</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(consumptionCost)}</div>
            <div className="text-sm text-green-600">Consumption Cost</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalCost)}</div>
            <div className="text-sm text-purple-600">Total Cost</div>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <p><strong>Cost Breakdown:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Consumption: {unitsConsumed.toFixed(2)} units × {formatCurrency(costPerUnit)} = {formatCurrency(consumptionCost)}</li>
            {fixedCharge > 0 && (
              <li>Fixed Charge: {formatCurrency(fixedCharge)}</li>
            )}
            <li><strong>Total: {formatCurrency(totalCost)}</strong></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
