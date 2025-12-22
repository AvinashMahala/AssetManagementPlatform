import { IExpenseRepository } from '../../core/interfaces/IExpenseRepository';
import { Expense } from '../../core/types/expense.types';

export class GetExpensesByPropertyQuery {
  constructor(private expenseRepository: IExpenseRepository) {}

  async execute(propertyId: string): Promise<Expense[]> {
    return this.expenseRepository.findByProperty(propertyId);
  }
}
