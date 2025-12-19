import React from 'react';
import { Zap, Droplet, Flame, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import { Input } from '@/componentDesignLibrary';
import { Badge } from '@/componentDesignLibrary';
import type { MeterReadingInput } from '@/types/rentTransaction';
import { calculateMeterCharge, validateMeterReading, formatDate } from '@/utils/billingCalculations';

interface MeterReadingStepProps {
  meterReadings: MeterReadingInput[];
  onUpdate: (readings: MeterReadingInput[]) => void;
  validationErrors?: { [key: string]: string };
}

export const MeterReadingStep: React.FC<MeterReadingStepProps> = ({
  meterReadings,
  onUpdate,
}) => {
  const getMeterIcon = (type: string) => {
    switch (type) {
      case 'electricity':
        return Zap;
      case 'water':
        return Droplet;
      case 'gas':
        return Flame;
      default:
        return Zap;
    }
  };

  const handleReadingChange = (index: number, field: keyof MeterReadingInput, value: any) => {
    const updated = [...meterReadings];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-calculate if current reading changes
    if (field === 'currentReading') {
      const currentReading = parseFloat(value) || 0;
      const previousReading = updated[index].previousReading;
      const { unitsConsumed, totalCost } = calculateMeterCharge(
        previousReading,
        currentReading,
        updated[index].costPerUnit,
        updated[index].fixedCharge
      );

      updated[index].unitsConsumed = unitsConsumed;
      updated[index].totalCost = totalCost;
    }

    onUpdate(updated);
  };

  if (meterReadings.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No meters configured for this unit.</p>
            <p className="text-sm text-gray-500 mt-1">Add meters to track utility consumption.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Meter Readings</span>
            <Badge variant="outline">{meterReadings.length} meter(s)</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">Enter new meter readings to calculate utility charges</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {meterReadings.map((reading, index) => {
            const Icon = getMeterIcon(reading.meterType);
            const validation = validateMeterReading(reading.previousReading, reading.currentReading);

            return (
              <div key={reading.meterId} className="border border-gray-200 rounded-lg p-4">
                {/* Meter Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      reading.meterType === 'electricity' ? 'bg-yellow-100 text-yellow-700' :
                      reading.meterType === 'water' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{reading.meterName}</h3>
                      <p className="text-sm text-gray-600 capitalize">{reading.meterType}</p>
                      {reading.meterNumber && (
                        <p className="text-xs text-gray-500">Meter #{reading.meterNumber}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    ₹{reading.costPerUnit}/unit
                  </Badge>
                </div>

                {/* Reading Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Previous Reading */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Previous Reading
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={reading.previousReading}
                        disabled
                        className="bg-gray-50"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-gray-500">
                        {formatDate(reading.readingDate)}
                      </span>
                    </div>
                  </div>

                  {/* Current Reading */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Reading <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={reading.currentReading}
                      onChange={(e) => handleReadingChange(index, 'currentReading', e.target.value)}
                      min={reading.previousReading}
                      step="0.01"
                      required
                      className={!validation.valid ? 'border-red-500' : ''}
                    />
                    {!validation.valid && validation.error && (
                      <p className="text-xs text-red-600 mt-1">{validation.error}</p>
                    )}
                  </div>

                  {/* Reading Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reading Date
                    </label>
                    <Input
                      type="date"
                      value={reading.readingDate}
                      onChange={(e) => handleReadingChange(index, 'readingDate', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Calculation Display */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-600">Units Consumed</p>
                      <p className="text-lg font-bold text-blue-600">
                        {reading.unitsConsumed.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Rate/Unit</p>
                      <p className="text-lg font-semibold">
                        ₹{reading.costPerUnit.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Fixed Charge</p>
                      <p className="text-lg font-semibold">
                        ₹{reading.fixedCharge.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Cost</p>
                      <p className="text-xl font-bold text-green-600">
                        ₹{reading.totalCost.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Calculation Breakdown */}
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="text-xs text-gray-600">
                    Calculation: ({reading.unitsConsumed.toFixed(2)} units × ₹{reading.costPerUnit}) + ₹{reading.fixedCharge} fixed = ₹{reading.totalCost.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Total Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">Total Utility Charges</h3>
              <p className="text-sm text-gray-600">Sum of all meter charges for this period</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">
                ₹{meterReadings.reduce((sum, r) => sum + r.totalCost, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
