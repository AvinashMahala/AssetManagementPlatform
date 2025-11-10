import { Expense, ExpenseInput, ExpenseFilters, ExpenseStatistics } from '../../models/Expense';

export interface IExpenseRepository {
  findAll(): Promise<Expense[]>;
  findById(id: string): Promise<Expense | null>;
  findByProperty(propertyId: string): Promise<Expense[]>;
  findByUnit(unitId: string): Promise<Expense[]>;
  findActiveByProperty(propertyId: string): Promise<Expense[]>;
  findActiveByUnit(unitId: string): Promise<Expense[]>;
  findWithFilters(filters: ExpenseFilters): Promise<Expense[]>;
  create(data: ExpenseInput): Promise<Expense>;
  update(id: string, data: Partial<ExpenseInput>): Promise<Expense | null>;
  delete(id: string): Promise<boolean>;
  updateStatus(id: string, status: string): Promise<boolean>;
}

export interface IExpenseService {
  getAllExpenses(): Promise<Expense[]>;
  getExpenseById(id: string): Promise<Expense | null>;
  getExpensesByProperty(propertyId: string): Promise<Expense[]>;
  getExpensesByUnit(unitId: string): Promise<Expense[]>;
  getActiveExpensesByProperty(propertyId: string): Promise<Expense[]>;
  getActiveExpensesByUnit(unitId: string): Promise<Expense[]>;
  getExpensesWithFilters(filters: ExpenseFilters): Promise<Expense[]>;
  createExpense(data: ExpenseInput): Promise<Expense>;
  updateExpense(id: string, data: Partial<ExpenseInput>): Promise<Expense | null>;
  deleteExpense(id: string): Promise<boolean>;
  updateExpenseStatus(id: string, status: string): Promise<boolean>;
  getExpenseStatistics(propertyId?: string, startDate?: Date, endDate?: Date): Promise<ExpenseStatistics>;
}