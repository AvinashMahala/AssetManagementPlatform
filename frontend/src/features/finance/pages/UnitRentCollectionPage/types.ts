import type { BillingMeterReadingInput, ExpenseItem } from '@/features/finance/types';

export type { BillingMeterReadingInput as MeterReadingInput, ExpenseItem };

export interface ValidationSummary {
  lease: { valid: boolean; message: string };
  meterReadings: { valid: boolean; message: string };
  utilities: { valid: boolean; message: string };
  expenses: { valid: boolean; message: string };
  overall: { valid: boolean; message: string };
}

export interface InvoiceGenerationStatus {
  step: 'idle' | 'creating' | 'generating' | 'downloading' | 'complete' | 'error';
  message: string;
  currentStep: number;
  totalSteps: number;
}

export interface RentCollectionTotals {
  baseRent: number;
  maintenanceCharges: number;
  totalMeterCharges: number;
  totalUtilityCharges: number;
  totalExpenses: number;
  previousBalance: number;
  totalAmount: number;
}
