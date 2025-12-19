import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';

interface MeterReadingsHistoryProps {
  readings: any[]; // Replace with MeterReading type
}

export const MeterReadingsHistory: React.FC<MeterReadingsHistoryProps> = ({ readings }) => {
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
        <CardTitle>Readings History</CardTitle>
      </CardHeader>
      <CardContent>
        {readings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Date</th>
                  <th className="text-left py-2 px-4">Previous</th>
                  <th className="text-left py-2 px-4">Current</th>
                  <th className="text-left py-2 px-4">Consumed</th>
                  <th className="text-left py-2 px-4">Cost</th>
                </tr>
              </thead>
              <tbody>
                {readings.map((reading) => (
                  <tr key={reading.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{formatDate(reading.readingDate)}</td>
                    <td className="py-2 px-4">{reading.previousReading}</td>
                    <td className="py-2 px-4">{reading.currentReading}</td>
                    <td className="py-2 px-4">{reading.unitsConsumed}</td>
                    <td className="py-2 px-4">{formatCurrency(reading.totalCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No readings recorded yet</p>
        )}
      </CardContent>
    </Card>
  );
};
