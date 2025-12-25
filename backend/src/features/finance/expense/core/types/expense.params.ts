import { ExpenseType, ExpenseFrequency, ExpenseDistribution, ExpenseStatus } from './expense.types';

export interface CreateExpenseParams {
  propertyId: string;
  unitId?: string;
  type: ExpenseType;
  description: string;
  amount: number;
  frequency: ExpenseFrequency;
  startDate: Date;
  endDate?: Date;
  distribution: ExpenseDistribution;
  affectedUnitIds?: string[];
  billPhotoUrl?: string;
  status?: ExpenseStatus;
  createdBy: string;
}

export interface UpdateExpenseParams {
  type?: ExpenseType;
  description?: string;
  amount?: number;
  frequency?: ExpenseFrequency;
  startDate?: Date;
  endDate?: Date;
  distribution?: ExpenseDistribution;
  affectedUnitIds?: string[];
  billPhotoUrl?: string;
  status?: ExpenseStatus;
  updatedBy: string;
}
