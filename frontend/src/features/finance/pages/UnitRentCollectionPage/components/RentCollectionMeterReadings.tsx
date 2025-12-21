import React from 'react';
import { Zap, Droplet, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Input } from '@/componentDesignLibrary';
import { validateMeterReading } from '@/utils/billingCalculations';
import type { MeterReadingInput } from '../types';

interface RentCollectionMeterReadingsProps {
  meterReadings: MeterReadingInput[];
  onMeterReadingChange: (index: number, value: string) => void;
}

export const RentCollectionMeterReadings: React.FC<RentCollectionMeterReadingsProps> = ({
  meterReadings,
  onMeterReadingChange
}) => {
  if (meterReadings.length === 0) return null;

  const getMeterIcon = (type: string) => {
    switch (type) {
      case 'electricity': return Zap;
      case 'water': return Droplet;
      case 'gas': return Flame;
      default: return Zap;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Meter Readings</span>
          <Badge variant="outline">{meterReadings.length} meter(s)</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {meterReadings.map((reading, index) => {
          const Icon = getMeterIcon(reading.meterType);
          const validation = validateMeterReading(reading.previousReading, reading.currentReading);

          return (
            <div key={reading.meterId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  reading.meterType === 'electricity' ? 'bg-yellow-100' :
                  reading.meterType === 'water' ? 'bg-blue-100' : 'bg-orange-100'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{reading.meterName}</h4>
                  <p className="text-sm text-gray-600 capitalize">{reading.meterType}</p>
                </div>
                <Badge>₹{reading.costPerUnit}/unit</Badge>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Previous</label>
                  <Input value={reading.previousReading} disabled className="bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Current *</label>
                  <Input
                    type="number"
                    value={reading.currentReading}
                    onChange={(e) => onMeterReadingChange(index, e.target.value)}
                    min={reading.previousReading}
                    step="0.01"
                    className={!validation.valid ? 'border-red-500' : ''}
                  />
                  {!validation.valid && (
                    <p className="text-xs text-red-600 mt-1">{validation.error}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Total Cost</label>
                  <div className="text-lg font-bold text-green-600 py-2">
                    ₹{reading.totalCost.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                {reading.unitsConsumed.toFixed(2)} units × ₹{reading.costPerUnit} + ₹{reading.fixedCharge} = ₹{reading.totalCost.toFixed(2)}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
