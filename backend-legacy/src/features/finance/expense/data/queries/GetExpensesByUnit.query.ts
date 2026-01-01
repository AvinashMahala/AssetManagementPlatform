import { IExpenseRepository } from '../../core/interfaces/IExpenseRepository';
import { Expense } from '../../core/types/expense.types';

export class GetExpensesByUnitQuery {
  constructor(private expenseRepository: IExpenseRepository) {}

  async execute(unitId: string): Promise<Expense[]> {
    return this.expenseRepository.findByUnit(unitId);
  }
}
