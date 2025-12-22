import { Pool } from 'pg';
import { ExpenseRepository } from './data/repository/ExpenseRepository';
import { CreateExpenseUseCase } from './core/use-cases/CreateExpense.usecase';
import { UpdateExpenseUseCase } from './core/use-cases/UpdateExpense.usecase';
import { DeleteExpenseUseCase } from './core/use-cases/DeleteExpense.usecase';
import { GetExpenseByIdQuery } from './data/queries/GetExpenseById.query';
import { ListExpensesQuery } from './data/queries/ListExpenses.query';
import { GetExpensesByPropertyQuery } from './data/queries/GetExpensesByProperty.query';
import { GetExpensesByUnitQuery } from './data/queries/GetExpensesByUnit.query';
import { ExpenseController } from './api/ExpenseController';
import { createExpenseRoutes } from './api/expense.routes';

export class ExpenseModule {
  public controller: ExpenseController;
  public repository: ExpenseRepository;

  constructor(private db: Pool) {
    this.repository = new ExpenseRepository(db);

    const createUseCase = new CreateExpenseUseCase(this.repository);
    const updateUseCase = new UpdateExpenseUseCase(this.repository);
    const deleteUseCase = new DeleteExpenseUseCase(this.repository);
    const getByIdQuery = new GetExpenseByIdQuery(this.repository);
    const listQuery = new ListExpensesQuery(this.repository);
    const getByPropertyQuery = new GetExpensesByPropertyQuery(this.repository);
    const getByUnitQuery = new GetExpensesByUnitQuery(this.repository);

    this.controller = new ExpenseController(
      createUseCase,
      updateUseCase,
      deleteUseCase,
      getByIdQuery,
      listQuery,
      getByPropertyQuery,
      getByUnitQuery
    );
  }

  getRoutes(authMiddleware: any) {
    return createExpenseRoutes(this.controller, authMiddleware);
  }
}
