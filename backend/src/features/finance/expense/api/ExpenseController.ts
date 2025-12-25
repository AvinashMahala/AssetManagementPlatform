import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/shared/middleware/authMiddleware';
import { CreateExpenseUseCase } from '../core/use-cases/CreateExpense.usecase';
import { UpdateExpenseUseCase } from '../core/use-cases/UpdateExpense.usecase';
import { DeleteExpenseUseCase } from '../core/use-cases/DeleteExpense.usecase';
import { GetExpenseByIdQuery } from '../data/queries/GetExpenseById.query';
import { ListExpensesQuery } from '../data/queries/ListExpenses.query';
import { GetExpensesByPropertyQuery } from '../data/queries/GetExpensesByProperty.query';
import { GetExpensesByUnitQuery } from '../data/queries/GetExpensesByUnit.query';
import { CreateExpenseParams, UpdateExpenseParams } from '../core/types/expense.params';
import { ExpenseFilters } from '../core/types/expense.types';

export class ExpenseController {
  constructor(
    private createExpenseUseCase: CreateExpenseUseCase,
    private updateExpenseUseCase: UpdateExpenseUseCase,
    private deleteExpenseUseCase: DeleteExpenseUseCase,
    private getExpenseByIdQuery: GetExpenseByIdQuery,
    private listExpensesQuery: ListExpensesQuery,
    private getExpensesByPropertyQuery: GetExpensesByPropertyQuery,
    private getExpensesByUnitQuery: GetExpensesByUnitQuery
  ) {}

  async createExpense(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const params: CreateExpenseParams = {
        ...req.body,
        createdBy: userId
      };
      const expense = await this.createExpenseUseCase.execute(params);
      res.status(201).json({ success: true, data: expense });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  async updateExpense(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const params: UpdateExpenseParams = {
        ...req.body,
        updatedBy: userId
      };
      const expense = await this.updateExpenseUseCase.execute({ id, data: params });
      if (!expense) {
        res.status(404).json({ success: false, message: 'Expense not found' });
        return;
      }
      res.json({ success: true, data: expense });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  async deleteExpense(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.deleteExpenseUseCase.execute(id);
      if (!success) {
        res.status(404).json({ success: false, message: 'Expense not found' });
        return;
      }
      res.json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  async getExpenseById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const expense = await this.getExpenseByIdQuery.execute(id);
      if (!expense) {
        res.status(404).json({ success: false, message: 'Expense not found' });
        return;
      }
      res.json({ success: true, data: expense });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  async getAllExpenses(req: Request, res: Response): Promise<void> {
    try {
      const filters: ExpenseFilters = req.query as any;
      const expenses = await this.listExpensesQuery.execute(filters);
      res.json({ success: true, data: expenses });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  async getExpensesByProperty(req: Request, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;
      const expenses = await this.getExpensesByPropertyQuery.execute(propertyId);
      res.json({ success: true, data: expenses });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  async getExpensesByUnit(req: Request, res: Response): Promise<void> {
    try {
      const { unitId } = req.params;
      const expenses = await this.getExpensesByUnitQuery.execute(unitId);
      res.json({ success: true, data: expenses });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }
}
