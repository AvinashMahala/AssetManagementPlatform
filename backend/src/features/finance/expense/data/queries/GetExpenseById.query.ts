import { IExpenseRepository } from '../../core/interfaces/IExpenseRepository';
import { Expense } from '../../core/types/expense.types';

export class GetExpenseByIdQuery {
  constructor(private expenseRepository: IExpenseRepository) {}

  async execute(id: string): Promise<Expense | null> {
    return this.expenseRepository.findById(id);
  }
}
