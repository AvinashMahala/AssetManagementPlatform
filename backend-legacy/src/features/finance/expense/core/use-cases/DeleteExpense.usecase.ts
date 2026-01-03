import { IUseCase } from '@/shared/core/IUseCase';
import { IExpenseRepository } from '../interfaces/IExpenseRepository';

export class DeleteExpenseUseCase implements IUseCase<string, boolean> {
  constructor(private expenseRepository: IExpenseRepository) {}

  async execute(id: string): Promise<boolean> {
    return this.expenseRepository.delete(id);
  }
}
