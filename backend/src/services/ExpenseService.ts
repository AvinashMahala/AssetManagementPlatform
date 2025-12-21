import { Expense, ExpenseInput, ExpenseUpdateInput, ExpenseFilters, ExpenseStatistics, ExpenseWithDetails, ExpenseStatus } from '../models/Expense';
import { IExpenseRepository } from '../interfaces/repositories/IExpenseRepository';
import { IExpenseService } from '../interfaces/services/IExpenseService';
import { IPropertyRepository } from '../interfaces/repositories/IPropertyRepository';
import { IUnitRepository } from '@/features/properties/unit/core/interfaces/IUnitRepository';

export class ExpenseService implements IExpenseService {
  constructor(
    private expenseRepository: IExpenseRepository,
    private propertyRepository: IPropertyRepository,
    private unitRepository: IUnitRepository
  ) {}

  async getAllExpenses(): Promise<Expense[]> {
    return this.expenseRepository.findAll();
  }

  async getAllExpensesWithDetails(): Promise<ExpenseWithDetails[]> {
    const expenses = await this.expenseRepository.findAll();
    return this.populateExpenseDetails(expenses);
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

  async createExpense(expenseData: ExpenseInput, userId: string): Promise<Expense> {
    // Validate required fields
    if (!expenseData.propertyId) {
      throw new Error('Property ID is required');
    }
    if (!expenseData.type) {
      throw new Error('Expense type is required');
    }
    if (!expenseData.description) {
      throw new Error('Expense description is required');
    }
    if (!expenseData.amount || expenseData.amount <= 0) {
      throw new Error('Valid expense amount is required');
    }
    if (!expenseData.frequency) {
      throw new Error('Expense frequency is required');
    }
    if (!expenseData.startDate) {
      throw new Error('Start date is required');
    }
    if (!expenseData.distribution) {
      throw new Error('Distribution method is required');
    }

    // Set default status if not provided and add createdBy
    const expenseDataWithUser: ExpenseInput = {
      ...expenseData,
      createdBy: userId,
      status: expenseData.status || ExpenseStatus.ACTIVE
    };

    return this.expenseRepository.create(expenseDataWithUser);
  }

  async updateExpense(id: string, expenseData: ExpenseUpdateInput, userId: string): Promise<Expense | null> {
    // Validate that at least one field is being updated
    if (Object.keys(expenseData).length === 0) {
      throw new Error('At least one field must be provided for update');
    }

    // Validate amount if provided
    if (expenseData.amount !== undefined && expenseData.amount <= 0) {
      throw new Error('Expense amount must be greater than 0');
    }

    // Add updatedBy to the update data
    const updateDataWithUser = {
      ...expenseData,
      updatedBy: userId
    };

    return this.expenseRepository.update(id, updateDataWithUser);
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

  async getExpenseStatistics(propertyId: string): Promise<ExpenseStatistics> {
    // For now, return basic statistics
    // In a real implementation, this would aggregate data from the repository
    const expenses = await this.expenseRepository.findWithFilters({
      propertyId
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

  // Additional methods to satisfy interface
  async archiveExpense(id: string, userId: string): Promise<boolean> {
    return this.updateExpenseStatus(id, 'archived');
  }

  async activateExpense(id: string, userId: string): Promise<boolean> {
    return this.updateExpenseStatus(id, 'active');
  }

  async getMonthlyExpenseAmount(propertyId: string, month: Date): Promise<number> {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    const expenses = await this.expenseRepository.findWithFilters({
      propertyId,
      startDateFrom: startOfMonth,
      startDateTo: endOfMonth,
      isActive: true
    });

    return expenses
      .filter(e => e.frequency === 'monthly')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  async getExpensesForRentTransaction(propertyId: string, unitId: string | null, billingMonth: string): Promise<Expense[]> {
    // Parse billing month (assuming format like "2024-11")
    const [year, month] = billingMonth.split('-').map(Number);
    const billingDate = new Date(year, month - 1, 1);
    
    return this.expenseRepository.findWithFilters({
      propertyId,
      unitId: unitId || undefined,
      startDateTo: billingDate,
      isActive: true
    });
  }

  async duplicateExpense(id: string, userId: string): Promise<Expense> {
    const originalExpense = await this.getExpenseById(id);
    if (!originalExpense) {
      throw new Error('Expense not found');
    }

    const duplicatedData: ExpenseInput = {
      ...originalExpense,
      description: `${originalExpense.description} (Copy)`,
      createdBy: userId,
      updatedBy: userId
    };

    // Remove fields that shouldn't be duplicated
    delete (duplicatedData as any).id;
    delete (duplicatedData as any).createdAt;
    delete (duplicatedData as any).updatedAt;

    return this.createExpense(duplicatedData, userId);
  }

  async bulkUpdateExpenses(expenseIds: string[], updates: ExpenseUpdateInput, userId: string): Promise<number> {
    let updatedCount = 0;
    for (const id of expenseIds) {
      try {
        await this.updateExpense(id, updates, userId);
        updatedCount++;
      } catch (error) {
        // Continue with other expenses if one fails
        console.error(`Failed to update expense ${id}:`, error);
      }
    }
    return updatedCount;
  }

  // With related data methods
  async getExpenseWithDetails(id: string): Promise<ExpenseWithDetails | null> {
    const expense = await this.getExpenseById(id);
    if (!expense) return null;

    const expensesWithDetails = await this.populateExpenseDetails([expense]);
    return expensesWithDetails[0] || null;
  }

  async getExpensesWithDetailsByProperty(propertyId: string): Promise<ExpenseWithDetails[]> {
    const expenses = await this.getExpensesByProperty(propertyId);
    return this.populateExpenseDetails(expenses);
  }

  private async populateExpenseDetails(expenses: Expense[]): Promise<ExpenseWithDetails[]> {
    // Get unique property IDs and unit IDs
    const propertyIds = [...new Set(expenses.map(e => e.propertyId))];
    const unitIds = [...new Set(expenses.flatMap(e => e.affectedUnitIds || []).concat(expenses.map(e => e.unitId).filter(Boolean) as string[]))];

    // Fetch properties and units
    const properties = await Promise.all(propertyIds.map(id => this.propertyRepository.findById(id)));
    const units = await Promise.all(unitIds.map(id => this.unitRepository.findById(id)));

    // Create lookup maps
    const propertyMap = new Map(properties.filter((p): p is NonNullable<typeof p> => p !== null).map(p => [p.id, p]));
    const unitMap = new Map(units.filter((u): u is NonNullable<typeof u> => u !== null).map(u => [u.id, u]));

    return expenses.map(expense => ({
      ...expense,
      property: expense.propertyId ? {
        id: expense.propertyId,
        name: propertyMap.get(expense.propertyId)?.name || 'Unknown Property'
      } : undefined,
      unit: expense.unitId ? {
        id: expense.unitId,
        name: unitMap.get(expense.unitId)?.unitName || `Unit ${unitMap.get(expense.unitId)?.unitNumber}`,
        unitNumber: unitMap.get(expense.unitId)?.unitNumber || ''
      } : undefined,
      affectedUnits: expense.affectedUnitIds?.map(unitId => {
        const unit = unitMap.get(unitId);
        return unit ? {
          id: unit.id,
          name: unit.unitName || `Unit ${unit.unitNumber}`,
          unitNumber: unit.unitNumber || ''
        } : null;
      }).filter((u): u is NonNullable<typeof u> => u !== null) || []
    }));
  }
}