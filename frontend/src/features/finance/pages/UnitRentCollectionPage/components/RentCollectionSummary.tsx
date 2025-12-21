import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import type { ValidationSummary } from '../types';

interface RentCollectionSummaryProps {
  validationSummary: ValidationSummary;
}

export const RentCollectionSummary: React.FC<RentCollectionSummaryProps> = ({ validationSummary }) => {
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Validation Summary</span>
          {validationSummary.overall.valid ? (
            <span className="text-green-600 text-lg">✅</span>
          ) : (
            <span className="text-yellow-600 text-lg">⚠️</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            {validationSummary.lease.valid ? (
              <span className="text-green-600 text-lg">✅</span>
            ) : (
              <span className="text-red-600 text-lg">❌</span>
            )}
            <div>
              <p className="font-medium text-sm">Lease</p>
              <p className="text-xs text-gray-600">{validationSummary.lease.message}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            {validationSummary.meterReadings.valid ? (
              <span className="text-green-600 text-lg">✅</span>
            ) : (
              <span className="text-yellow-600 text-lg">⚠️</span>
            )}
            <div>
              <p className="font-medium text-sm">Meter Readings</p>
              <p className="text-xs text-gray-600">{validationSummary.meterReadings.message}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            {validationSummary.utilities.valid ? (
              <span className="text-blue-600 text-lg">ℹ️</span>
            ) : (
              <span className="text-gray-600 text-lg">ℹ️</span>
            )}
            <div>
              <p className="font-medium text-sm">Utilities</p>
              <p className="text-xs text-gray-600">{validationSummary.utilities.message}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            {validationSummary.expenses.valid ? (
              <span className="text-green-600 text-lg">✅</span>
            ) : (
              <span className="text-orange-600 text-lg">ℹ️</span>
            )}
            <div>
              <p className="font-medium text-sm">Expenses</p>
              <p className="text-xs text-gray-600">{validationSummary.expenses.message}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 rounded-lg bg-gray-50 border">
          <p className="text-sm font-medium flex items-center gap-2">
            {validationSummary.overall.valid ? (
              <span className="text-green-600">✅</span>
            ) : (
              <span className="text-yellow-600">⚠️</span>
            )}
            {validationSummary.overall.message}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
