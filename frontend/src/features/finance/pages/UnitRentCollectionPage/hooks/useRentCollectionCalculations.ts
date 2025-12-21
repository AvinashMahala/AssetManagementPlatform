import { useMemo } from 'react';
import type { Unit } from '@/features/units/types';
import type { UnitUtility } from '@/features/units/types';
import type { MeterReadingInput, ExpenseItem, RentCollectionTotals } from '../types';

interface UseRentCollectionCalculationsProps {
  unit?: Unit | null;
  meterReadings: MeterReadingInput[];
  expenses: ExpenseItem[];
  utilities: UnitUtility[];
}

export const useRentCollectionCalculations = ({ unit, meterReadings, expenses, utilities }: UseRentCollectionCalculationsProps) => {
  const totals: RentCollectionTotals = useMemo(() => {
    const baseRent = unit?.monthlyRent || 0;
    const maintenanceCharges = unit?.maintenanceCharges || 0;
    const totalMeterCharges = meterReadings.reduce((sum, r) => sum + r.totalCost, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Calculate utility charges from configured utilities
    const totalUtilityCharges = utilities
      .filter(u => u.isEnabled)
      .reduce((sum, utility) => {
        if (utility.billingMethod === 'fixed') {
          return sum + (utility.fixedAmount || 0);
        } else if (utility.billingMethod === 'meter_based') {
          // For meter-based utilities, the charge is already calculated in meterReadings
          // So we don't double-count here
          return sum;
        }
        return sum;
      }, 0);

    const previousBalance = 0; // TODO: Get from last transaction
    const totalAmount = baseRent + maintenanceCharges + totalMeterCharges + totalUtilityCharges + totalExpenses + previousBalance;

    return {
      baseRent,
      maintenanceCharges,
      totalMeterCharges,
      totalUtilityCharges,
      totalExpenses,
      previousBalance,
      totalAmount,
    };
  }, [unit, meterReadings, expenses, utilities]);

  return totals;
};
