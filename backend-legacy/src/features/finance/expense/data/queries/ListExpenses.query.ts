import { IExpenseRepository } from '../../core/interfaces/IExpenseRepository';
import { Expense, ExpenseFilters } from '../../core/types/expense.types';

export class ListExpensesQuery {
  constructor(private expenseRepository: IExpenseRepository) {}

  async execute(filters: ExpenseFilters = {}): Promise<Expense[]> {
    if (Object.keys(filters).length === 0) {
      return this.expenseRepository.findAll();
    }
    return this.expenseRepository.findWithFilters(filters);
  }
}
