import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';

interface MeterLatestReadingCardProps {
  reading: any; // Replace with MeterReading type
}

export const MeterLatestReadingCard: React.FC<MeterLatestReadingCardProps> = ({ reading }) => {
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
        <CardTitle>Latest Reading</CardTitle>
      </CardHeader>
      <CardContent>
        {reading ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Reading Date</label>
              <p className="text-gray-900">{formatDate(reading.readingDate)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Current Reading</label>
              <p className="text-gray-900">{reading.currentReading}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Units Consumed</label>
              <p className="text-gray-900">{reading.unitsConsumed}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Total Cost</label>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(reading.totalCost)}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">No readings recorded yet</p>
        )}
      </CardContent>
    </Card>
  );
};
