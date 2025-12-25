import { Expense, ExpenseFilters } from '../types/expense.types';
import { CreateExpenseParams, UpdateExpenseParams } from '../types/expense.params';

export interface IExpenseRepository {
  findAll(): Promise<Expense[]>;
  findById(id: string): Promise<Expense | null>;
  findByProperty(propertyId: string): Promise<Expense[]>;
  findByUnit(unitId: string): Promise<Expense[]>;
  findActiveByProperty(propertyId: string): Promise<Expense[]>;
  findActiveByUnit(unitId: string): Promise<Expense[]>;
  findWithFilters(filters: ExpenseFilters): Promise<Expense[]>;
  create(data: CreateExpenseParams): Promise<Expense>;
  update(id: string, data: UpdateExpenseParams): Promise<Expense | null>;
  delete(id: string): Promise<boolean>;
  updateStatus(id: string, status: string): Promise<boolean>;
}
