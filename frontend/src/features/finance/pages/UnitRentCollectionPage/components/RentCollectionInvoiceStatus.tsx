import React from 'react';
import { Card, CardContent } from '@/componentDesignLibrary';
import type { InvoiceGenerationStatus } from '../types';

interface RentCollectionInvoiceStatusProps {
  status: InvoiceGenerationStatus;
}

export const RentCollectionInvoiceStatus: React.FC<RentCollectionInvoiceStatusProps> = ({ status }) => {
  if (status.step === 'idle') return null;

  return (
    <Card className={`border-2 ${
      status.step === 'error' ? 'border-red-500 bg-red-50' :
      status.step === 'complete' ? 'border-green-500 bg-green-50' :
      'border-blue-500 bg-blue-50'
    }`}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          {status.step === 'creating' && (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div>
                <p className="font-semibold text-blue-900">Creating Transaction</p>
                <p className="text-sm text-blue-700">{status.message}</p>
                <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(status.currentStep / status.totalSteps) * 100}%` }}></div>
                </div>
              </div>
            </div>
          )}
          {status.step === 'generating' && (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <div>
                <p className="font-semibold text-purple-900">Generating PDF</p>
                <p className="text-sm text-purple-700">{status.message}</p>
                <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(status.currentStep / status.totalSteps) * 100}%` }}></div>
                </div>
              </div>
            </div>
          )}
          {status.step === 'downloading' && (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <div>
                <p className="font-semibold text-indigo-900">Downloading</p>
                <p className="text-sm text-indigo-700">{status.message}</p>
                <div className="mt-2 w-full bg-indigo-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(status.currentStep / status.totalSteps) * 100}%` }}></div>
                </div>
              </div>
            </div>
          )}
          {status.step === 'complete' && (
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-green-900">Success!</p>
                <p className="text-sm text-green-700">{status.message}</p>
                <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          )}
          {status.step === 'error' && (
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700">{status.message}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
