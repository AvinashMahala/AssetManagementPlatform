import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';

interface MeterInfoCardProps {
  meter: any; // Replace with Meter type
}

export const MeterInfoCard: React.FC<MeterInfoCardProps> = ({ meter }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meter Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-600">Meter Name</label>
          <p className="text-gray-900">{meter.meterName}</p>
        </div>
        {meter.meterNumber && (
          <div>
            <label className="text-sm font-medium text-gray-600">Meter Number</label>
            <p className="text-gray-900">{meter.meterNumber}</p>
          </div>
        )}
        <div>
          <label className="text-sm font-medium text-gray-600">Meter Type</label>
          <p className="text-gray-900">{meter.meterType.charAt(0).toUpperCase() + meter.meterType.slice(1)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Cost per Unit</label>
          <p className="text-gray-900">{formatCurrency(meter.costPerUnit)}</p>
        </div>
        {meter.fixedCharge && (
          <div>
            <label className="text-sm font-medium text-gray-600">Fixed Charge</label>
            <p className="text-gray-900">{formatCurrency(meter.fixedCharge)}</p>
          </div>
        )}
        {meter.remarks && (
          <div>
            <label className="text-sm font-medium text-gray-600">Remarks</label>
            <p className="text-gray-900">{meter.remarks}</p>
          </div>
        )}
        <div>
          <label className="text-sm font-medium text-gray-600">Created</label>
          <p className="text-gray-900">{formatDate(meter.createdAt)}</p>
        </div>
      </CardContent>
    </Card>
  );
};
