import { IUseCase } from '@/shared/core/IUseCase';
import { IExpenseRepository } from '../interfaces/IExpenseRepository';
import { CreateExpenseParams } from '../types/expense.params';
import { Expense, ExpenseStatus } from '../types/expense.types';

export class CreateExpenseUseCase implements IUseCase<CreateExpenseParams, Expense> {
  constructor(private expenseRepository: IExpenseRepository) {}

  async execute(request: CreateExpenseParams): Promise<Expense> {
    this.validate(request);

    const expenseData = {
      ...request,
      status: request.status || ExpenseStatus.ACTIVE
    };

    return this.expenseRepository.create(expenseData);
  }

  private validate(request: CreateExpenseParams): void {
    if (!request.propertyId) {
      throw new Error('Property ID is required');
    }
    if (!request.type) {
      throw new Error('Expense type is required');
    }
    if (!request.description) {
      throw new Error('Expense description is required');
    }
    if (!request.amount || request.amount <= 0) {
      throw new Error('Valid expense amount is required');
    }
    if (!request.frequency) {
      throw new Error('Expense frequency is required');
    }
    if (!request.startDate) {
      throw new Error('Start date is required');
    }
    if (!request.distribution) {
      throw new Error('Distribution method is required');
    }
  }
}
