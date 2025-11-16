import { Expense, ExpenseInput, ExpenseUpdateInput, ExpenseFilters, ExpenseStatistics, ExpenseWithDetails } from '../../models/Expense';

export interface IExpenseService {
  // CRUD operations
  getAllExpenses(): Promise<Expense[]>;
  getAllExpensesWithDetails(): Promise<ExpenseWithDetails[]>;
  getExpenseById(id: string): Promise<Expense | null>;
  getExpensesByProperty(propertyId: string): Promise<Expense[]>;
  getExpensesByUnit(unitId: string): Promise<Expense[]>;
  getActiveExpensesByProperty(propertyId: string): Promise<Expense[]>;
  getActiveExpensesByUnit(unitId: string): Promise<Expense[]>;

  // Filtered queries
  getExpensesWithFilters(filters: ExpenseFilters): Promise<Expense[]>;

  // Create, update, delete
  createExpense(expenseData: ExpenseInput, userId: string): Promise<Expense>;
  updateExpense(id: string, expenseData: ExpenseUpdateInput, userId: string): Promise<Expense | null>;
  deleteExpense(id: string): Promise<boolean>;
  archiveExpense(id: string, userId: string): Promise<boolean>;
  activateExpense(id: string, userId: string): Promise<boolean>;

  // Statistics and analytics
  getExpenseStatistics(propertyId: string): Promise<ExpenseStatistics>;
  getMonthlyExpenseAmount(propertyId: string, month: Date): Promise<number>;
  getExpensesForRentTransaction(propertyId: string, unitId: string | null, billingMonth: string): Promise<Expense[]>;

  // Advanced operations
  duplicateExpense(id: string, userId: string): Promise<Expense>;
  bulkUpdateExpenses(expenseIds: string[], updates: ExpenseUpdateInput, userId: string): Promise<number>;

  // With related data
  getExpenseWithDetails(id: string): Promise<ExpenseWithDetails | null>;
  getExpensesWithDetailsByProperty(propertyId: string): Promise<ExpenseWithDetails[]>;
}