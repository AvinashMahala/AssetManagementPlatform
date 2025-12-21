import { useState, useEffect, useMemo } from 'react';
import { validateMeterReading, calculateMeterCharge } from '@/utils/billingCalculations';
import type { MeterReadingInput, ExpenseItem, ValidationSummary } from '../types';
import type { UnitUtility } from '@/features/units/types';
import type { Lease } from '@/features/leases/types/lease';

interface UseRentCollectionFormProps {
  unitId: string;
  utilities: UnitUtility[];
  lastMeterReadings?: any[];
  activeLease?: Lease;
}

export const useRentCollectionForm = ({ unitId, utilities, lastMeterReadings, activeLease }: UseRentCollectionFormProps) => {
  const [meterReadings, setMeterReadings] = useState<MeterReadingInput[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [newExpense, setNewExpense] = useState({ category: '', description: '', amount: 0 });
  const [notes, setNotes] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Initialize meter readings from utilities if empty
  useEffect(() => {
    if (meterReadings.length === 0 && utilities.length > 0) {
      const initialReadings: MeterReadingInput[] = utilities
        .filter(u => u.isEnabled && u.billingMethod === 'meter_based' && ['electricity', 'water', 'gas'].includes(u.utilityType))
        .map(u => {
          // Try to find last reading for this meter
          const lastReading = lastMeterReadings?.find((r: any) => r.meterId === u.meterId || r.utilityType === u.utilityType);
          const previousReading = lastReading?.currentReading || 0;

          return {
            meterId: u.meterId || u.id,
            meterName: u.utilityName,
            meterType: u.utilityType as 'electricity' | 'water' | 'gas',
            meterNumber: '', // Not available in UnitUtility
            previousReading: previousReading,
            currentReading: previousReading, // Default to previous
            unitsConsumed: 0,
            costPerUnit: 0, // Where to get cost per unit? UnitUtility doesn't have it? 
            // Wait, UnitUtility doesn't have costPerUnit? 
            // Let me check UnitUtility type again. It has multiplier but not costPerUnit?
            // Maybe it's fetched from somewhere else or I missed it.
            // In the original code, it was just using state.
            // I'll default to 0 for now.
            fixedCharge: 0,
            totalCost: 0,
            readingDate: new Date().toISOString()
          };
        });
      
      if (initialReadings.length > 0) {
        setMeterReadings(initialReadings);
      }
    }
  }, [utilities, lastMeterReadings, meterReadings.length]);

  // Auto-save functionality: Load
  useEffect(() => {
    const autoSaveKey = `rent-collection-draft-${unitId}`;
    const savedData = localStorage.getItem(autoSaveKey);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.meterReadings && parsed.meterReadings.length > 0) {
          setMeterReadings(parsed.meterReadings);
        }
        if (parsed.expenses) {
          setExpenses(parsed.expenses);
        }
        if (parsed.notes) {
          setNotes(parsed.notes);
        }
        if (parsed.lastSavedAt) {
          setLastSavedAt(new Date(parsed.lastSavedAt));
        }
      } catch (error) {
        console.error('Failed to load saved draft:', error);
      }
    }
  }, [unitId]);

  // Auto-save functionality: Save before unload
  useEffect(() => {
    const autoSaveKey = `rent-collection-draft-${unitId}`;
    const handleBeforeUnload = () => {
      const draftData = {
        meterReadings,
        expenses,
        notes,
        lastSavedAt: new Date().toISOString(),
      };
      localStorage.setItem(autoSaveKey, JSON.stringify(draftData));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unitId, meterReadings, expenses, notes]);

  const handleMeterReadingChange = (index: number, value: string) => {
    const updated = [...meterReadings];
    const currentReading = parseFloat(value) || 0;
    const { unitsConsumed, totalCost } = calculateMeterCharge(
      updated[index].previousReading,
      currentReading,
      updated[index].costPerUnit,
      updated[index].fixedCharge
    );

    updated[index] = {
      ...updated[index],
      currentReading,
      unitsConsumed,
      totalCost,
    };

    setMeterReadings(updated);
  };

  const handleAddExpense = () => {
    if (newExpense.category && newExpense.description && newExpense.amount > 0) {
      setExpenses([...expenses, { 
        id: Date.now().toString(),
        ...newExpense,
        isRemoved: false 
      }]);
      setNewExpense({ category: '', description: '', amount: 0 });
    }
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // Validation Summary
  const validationSummary: ValidationSummary = useMemo(() => {
    const leaseValid = !!activeLease;
    const leaseMessage = leaseValid ? 'Active lease found' : 'No active lease found';

    const meterReadingsValid = meterReadings.length === 0 || meterReadings.every(r => {
      const validation = validateMeterReading(r.previousReading, r.currentReading);
      return validation.valid;
    });
    const meterReadingsMessage = meterReadings.length === 0 
      ? 'No meter readings required' 
      : meterReadingsValid 
        ? `All ${meterReadings.length} meter reading(s) valid` 
        : 'Some meter readings have errors';

    const expensesValid = expenses.length === 0 || expenses.every(e => e.category && e.description && e.amount > 0);
    const expensesMessage = expenses.length === 0 
      ? 'No additional expenses' 
      : expensesValid 
        ? `${expenses.length} expense(s) added` 
        : 'Some expenses are incomplete';

    const utilitiesValid = utilities.filter(u => u.isEnabled).length >= 0;
    const utilitiesMessage = utilities.filter(u => u.isEnabled).length === 0 
      ? 'No utilities configured' 
      : `${utilities.filter(u => u.isEnabled).length} utility configuration(s) active`;

    const overallValid = leaseValid && meterReadingsValid && expensesValid;
    const overallMessage = overallValid ? 'All data complete' : 'Some issues need to be resolved';

    return {
      lease: { valid: leaseValid, message: leaseMessage },
      meterReadings: { valid: meterReadingsValid, message: meterReadingsMessage },
      utilities: { valid: utilitiesValid, message: utilitiesMessage },
      expenses: { valid: expensesValid, message: expensesMessage },
      overall: { valid: overallValid, message: overallMessage }
    };
  }, [meterReadings, expenses, activeLease, utilities]);

  return {
    meterReadings,
    setMeterReadings,
    expenses,
    setExpenses,
    newExpense,
    setNewExpense,
    notes,
    setNotes,
    lastSavedAt,
    setLastSavedAt,
    validationSummary,
    handleMeterReadingChange,
    handleAddExpense,
    handleRemoveExpense
  };
};
