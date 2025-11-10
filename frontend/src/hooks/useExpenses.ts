import { useCallback } from 'react';
import type { Expense, ExpenseInput, ExpenseUpdateInput, ExpenseFilters, ExpenseStatistics, ExpenseWithDetails } from '../types/expense';
import { useApi, useApiMutation } from './useApi';
import { expenseService } from '../services/expenseService';

export function useExpenses(filters?: ExpenseFilters) {
  const query = useCallback(() => expenseService.getAll(filters), [filters]);
  const { data, loading, error, refetch } = useApi<ExpenseWithDetails[]>(query, [filters]);

  return {
    expenses: data || [],
    loading,
    error,
    refetch,
  };
}

export function useExpense(id: string) {
  const query = useCallback(() => expenseService.getById(id), [id]);
  return useApi<ExpenseWithDetails>(query, [id]);
}

export function useCreateExpense() {
  return useApiMutation<Expense, ExpenseInput>((data) => expenseService.create(data));
}

export function useUpdateExpense() {
  return useApiMutation<Expense, { id: string; data: ExpenseUpdateInput }>(
    ({ id, data }) => expenseService.update(id, data)
  );
}

export function useDeleteExpense() {
  return useApiMutation<void, string>((id) => expenseService.delete(id));
}

export function useExpenseStatistics(propertyId?: string) {
  const query = useCallback(() => expenseService.getStatistics(propertyId), [propertyId]);
  return useApi<ExpenseStatistics>(query, [propertyId]);
}