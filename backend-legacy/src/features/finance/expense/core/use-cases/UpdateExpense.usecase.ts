import { IUseCase } from '@/shared/core/IUseCase';
import { IExpenseRepository } from '../interfaces/IExpenseRepository';
import { UpdateExpenseParams } from '../types/expense.params';
import { Expense } from '../types/expense.types';

export interface UpdateExpenseRequest {
  id: string;
  data: UpdateExpenseParams;
}

export class UpdateExpenseUseCase implements IUseCase<UpdateExpenseRequest, Expense | null> {
  constructor(private expenseRepository: IExpenseRepository) {}

  async execute(request: UpdateExpenseRequest): Promise<Expense | null> {
    const { id, data } = request;

    if (Object.keys(data).length === 0) {
      throw new Error('At least one field must be provided for update');
    }

    if (data.amount !== undefined && data.amount <= 0) {
      throw new Error('Expense amount must be greater than 0');
    }

    return this.expenseRepository.update(id, data);
  }
}
