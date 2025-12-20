import React from 'react';
import { Activity, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { MeterType } from '@/features/meters/types';
import { Card, CardContent } from '@/componentDesignLibrary';
import { Badge } from '@/componentDesignLibrary';

interface MeterStatusCardsProps {
  meter: any; // Replace with Meter type
  readingsCount: number;
}

export const MeterStatusCards: React.FC<MeterStatusCardsProps> = ({ meter, readingsCount }) => {
  const getMeterTypeColor = (type: MeterType) => {
    switch (type) {
      case MeterType.ELECTRICITY:
        return 'bg-yellow-100 text-yellow-800';
      case MeterType.WATER:
        return 'bg-blue-100 text-blue-800';
      case MeterType.GAS:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <Badge className={meter.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {meter.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <Activity className="h-8 w-8 text-gray-400" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Type</p>
              <Badge className={getMeterTypeColor(meter.meterType)}>
                {meter.meterType.charAt(0).toUpperCase() + meter.meterType.slice(1)}
              </Badge>
            </div>
            <TrendingUp className="h-8 w-8 text-gray-400" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cost per Unit</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(meter.costPerUnit)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-gray-400" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Readings</p>
              <p className="text-2xl font-bold text-gray-900">{readingsCount}</p>
            </div>
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
