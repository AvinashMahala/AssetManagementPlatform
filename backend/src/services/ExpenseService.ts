import { Expense, ExpenseInput, ExpenseFilters, ExpenseStatistics, ExpenseStatus } from '../models/Expense';
import { IExpenseRepository, IExpenseService } from '../interfaces/repositories/IExpenseRepository';

export class ExpenseService implements IExpenseService {
  constructor(private expenseRepository: IExpenseRepository) {}

  async getAllExpenses(): Promise<Expense[]> {
    return this.expenseRepository.findAll();
  }

  async getExpenseById(id: string): Promise<Expense | null> {
    return this.expenseRepository.findById(id);
  }

  async getExpensesByProperty(propertyId: string): Promise<Expense[]> {
    return this.expenseRepository.findByProperty(propertyId);
  }

  async getExpensesByUnit(unitId: string): Promise<Expense[]> {
    return this.expenseRepository.findByUnit(unitId);
  }

  async getActiveExpensesByProperty(propertyId: string): Promise<Expense[]> {
    return this.expenseRepository.findActiveByProperty(propertyId);
  }

  async getActiveExpensesByUnit(unitId: string): Promise<Expense[]> {
    return this.expenseRepository.findActiveByUnit(unitId);
  }

  async getExpensesWithFilters(filters: ExpenseFilters): Promise<Expense[]> {
    return this.expenseRepository.findWithFilters(filters);
  }

  async createExpense(data: ExpenseInput): Promise<Expense> {
    // Validate required fields
    if (!data.propertyId) {
      throw new Error('Property ID is required');
    }
    if (!data.type) {
      throw new Error('Expense type is required');
    }
    if (!data.description) {
      throw new Error('Expense description is required');
    }
    if (!data.amount || data.amount <= 0) {
      throw new Error('Valid expense amount is required');
    }
    if (!data.frequency) {
      throw new Error('Expense frequency is required');
    }
    if (!data.startDate) {
      throw new Error('Start date is required');
    }
    if (!data.distribution) {
      throw new Error('Distribution method is required');
    }
    if (!data.createdBy) {
      throw new Error('Created by user ID is required');
    }

    // Set default status if not provided
    const expenseData: ExpenseInput = {
      ...data,
      status: data.status || ExpenseStatus.ACTIVE
    };

    return this.expenseRepository.create(expenseData);
  }

  async updateExpense(id: string, data: Partial<ExpenseInput>): Promise<Expense | null> {
    // Validate that at least one field is being updated
    if (Object.keys(data).length === 0) {
      throw new Error('At least one field must be provided for update');
    }

    // Validate amount if provided
    if (data.amount !== undefined && data.amount <= 0) {
      throw new Error('Expense amount must be greater than 0');
    }

    return this.expenseRepository.update(id, data);
  }

  async deleteExpense(id: string): Promise<boolean> {
    return this.expenseRepository.delete(id);
  }

  async updateExpenseStatus(id: string, status: string): Promise<boolean> {
    // Validate status
    const validStatuses = ['active', 'inactive', 'archived'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    return this.expenseRepository.updateStatus(id, status);
  }

  async getExpenseStatistics(propertyId?: string, startDate?: Date, endDate?: Date): Promise<ExpenseStatistics> {
    // For now, return basic statistics
    // In a real implementation, this would aggregate data from the repository
    const expenses = await this.expenseRepository.findWithFilters({
      propertyId,
      startDateFrom: startDate,
      startDateTo: endDate
    });

    const totalExpenses = expenses.length;
    const activeExpenses = expenses.filter(e => e.isActive).length;
    const totalMonthlyAmount = expenses
      .filter(e => e.isActive && e.frequency === 'monthly')
      .reduce((sum, e) => sum + e.amount, 0);

    const expensesByType: Record<string, number> = {};
    const expensesByFrequency: Record<string, number> = {};
    const expensesByDistribution: Record<string, number> = {};

    expenses.forEach(expense => {
      expensesByType[expense.type] = (expensesByType[expense.type] || 0) + 1;
      expensesByFrequency[expense.frequency] = (expensesByFrequency[expense.frequency] || 0) + 1;
      expensesByDistribution[expense.distribution] = (expensesByDistribution[expense.distribution] || 0) + 1;
    });

    return {
      totalExpenses,
      activeExpenses,
      totalMonthlyAmount,
      expensesByType,
      expensesByFrequency,
      expensesByDistribution
    };
  }
}