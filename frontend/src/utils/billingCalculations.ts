/**
 * Billing Calculation Utilities
 * Helper functions for rent collection calculations
 */

import type { MeterReadingInput, ExpenseItem, LateFeeConfig } from '../types/rentTransaction';
import { formatCurrency } from './formatters';

// Re-export formatCurrency for backward compatibility
export { formatCurrency };

/**
 * Calculate meter charge
 */
export function calculateMeterCharge(
  previousReading: number,
  currentReading: number,
  costPerUnit: number,
  fixedCharge: number = 0
): {
  unitsConsumed: number;
  totalCost: number;
} {
  const unitsConsumed = currentReading - previousReading;
  const variableCost = unitsConsumed * costPerUnit;
  const totalCost = variableCost + fixedCharge;

  return {
    unitsConsumed: Math.max(0, unitsConsumed),
    totalCost: Math.max(0, totalCost),
  };
}

/**
 * Calculate total meter charges from all meter readings
 */
export function calculateTotalMeterCharges(meterReadings: MeterReadingInput[]): number {
  return meterReadings.reduce((total, reading) => total + reading.totalCost, 0);
}

/**
 * Calculate total expenses
 */
export function calculateTotalExpenses(expenses: ExpenseItem[]): number {
  return expenses
    .filter(expense => !expense.isRemoved)
    .reduce((total, expense) => total + expense.amount, 0);
}

/**
 * Calculate grand total
 */
export function calculateGrandTotal(
  baseRent: number,
  maintenanceCharges: number,
  meterCharges: number,
  expenses: number,
  previousBalance: number
): number {
  return baseRent + maintenanceCharges + meterCharges + expenses + previousBalance;
}

/**
 * Calculate new balance after payment
 */
export function calculateNewBalance(totalAmount: number, amountPaid: number): number {
  return Math.max(0, totalAmount - amountPaid);
}

/**
 * Calculate late fee
 */
export function calculateLateFee(
  totalAmount: number,
  dueDate: Date,
  currentDate: Date,
  config: LateFeeConfig
): {
  lateFee: number;
  daysOverdue: number;
} {
  if (!config.enabled) {
    return { lateFee: 0, daysOverdue: 0 };
  }

  const daysDiff = Math.floor((currentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysOverdue = Math.max(0, daysDiff - config.gracePeriodDays);

  if (daysOverdue <= 0) {
    return { lateFee: 0, daysOverdue: 0 };
  }

  let lateFee = 0;

  if (config.feeType === 'fixed') {
    lateFee = config.feeAmount || 0;
    if (config.compoundDaily) {
      lateFee = lateFee * daysOverdue;
    }
  } else if (config.feeType === 'percentage') {
    const percentage = (config.feePercentage || 0) / 100;
    lateFee = totalAmount * percentage;
    if (config.compoundDaily) {
      lateFee = lateFee * daysOverdue;
    }
  }

  // Apply max fee limit if configured
  if (config.maxFeeAmount && lateFee > config.maxFeeAmount) {
    lateFee = config.maxFeeAmount;
  }

  return {
    lateFee: Math.round(lateFee * 100) / 100, // Round to 2 decimal places
    daysOverdue,
  };
}

/**
 * Split charges equally among tenants
 */
export function splitChargesEqually(totalAmount: number, tenantCount: number): number[] {
  const amountPerTenant = totalAmount / tenantCount;
  return Array(tenantCount).fill(Math.round(amountPerTenant * 100) / 100);
}

/**
 * Split charges by percentage
 */
export function splitChargesByPercentage(
  totalAmount: number,
  percentages: number[]
): number[] {
  return percentages.map(percentage => 
    Math.round((totalAmount * percentage / 100) * 100) / 100
  );
}

/**
 * Split charges by fixed amounts
 */
export function splitChargesByAmount(
  totalAmount: number,
  amounts: number[]
): {
  shares: number[];
  remainder: number;
} {
  const totalAllocated = amounts.reduce((sum, amount) => sum + amount, 0);
  const remainder = totalAmount - totalAllocated;

  return {
    shares: amounts,
    remainder: Math.round(remainder * 100) / 100,
  };
}

/**
 * Format currency for display
 */

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Format month-year
 */
export function formatMonthYear(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Get billing period for current month
 */
export function getCurrentBillingPeriod(): {
  start: string;
  end: string;
  month: string;
  year: string;
} {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
    month: (now.getMonth() + 1).toString(),
    year: now.getFullYear().toString(),
  };
}

/**
 * Get billing period for specific month/year
 */
export function getBillingPeriod(month: number, year: number): {
  start: string;
  end: string;
} {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

/**
 * Validate meter reading
 */
export function validateMeterReading(
  previousReading: number,
  currentReading: number
): {
  valid: boolean;
  error?: string;
} {
  if (currentReading < previousReading) {
    return {
      valid: false,
      error: 'Current reading must be greater than or equal to previous reading',
    };
  }

  if (currentReading === previousReading) {
    // Warning but still valid
    return {
      valid: true,
      error: 'No consumption detected (readings are the same)',
    };
  }

  // Check for unrealistic consumption (optional)
  const consumption = currentReading - previousReading;
  if (consumption > 10000) {
    return {
      valid: false,
      error: 'Consumption seems unrealistically high. Please verify the reading.',
    };
  }

  return { valid: true };
}

/**
 * Generate unique invoice/receipt number
 */
export function generateDocumentNumber(
  prefix: string,
  propertyCode: string,
  sequenceNumber: number
): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const sequence = sequenceNumber.toString().padStart(4, '0');

  return `${prefix}${propertyCode}${year}${month}${sequence}`;
}
