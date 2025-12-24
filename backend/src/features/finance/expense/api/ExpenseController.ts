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

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Expense management endpoints
 */
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

  /**
   * @swagger
   * /expenses:
   *   post:
   *     summary: Create a new expense
   *     tags: [Expenses]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - propertyId
   *               - amount
   *               - date
   *               - category
   *             properties:
   *               propertyId:
   *                 type: string
   *               unitId:
   *                 type: string
   *               amount:
   *                 type: number
   *               date:
   *                 type: string
   *                 format: date
   *               category:
   *                 type: string
   *               description:
   *                 type: string
   *               vendor:
   *                 type: string
   *     responses:
   *       201:
   *         description: Expense created successfully
   *       400:
   *         description: Bad request
   */
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

  /**
   * @swagger
   * /expenses/{id}:
   *   put:
   *     summary: Update an expense
   *     tags: [Expenses]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Expense ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               amount:
   *                 type: number
   *               date:
   *                 type: string
   *                 format: date
   *               category:
   *                 type: string
   *               description:
   *                 type: string
   *               vendor:
   *                 type: string
   *     responses:
   *       200:
   *         description: Expense updated successfully
   *       404:
   *         description: Expense not found
   *       400:
   *         description: Bad request
   */
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

  /**
   * @swagger
   * /expenses/{id}:
   *   delete:
   *     summary: Delete an expense
   *     tags: [Expenses]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Expense ID
   *     responses:
   *       200:
   *         description: Expense deleted successfully
   *       404:
   *         description: Expense not found
   *       500:
   *         description: Internal server error
   */
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

  /**
   * @swagger
   * /expenses/{id}:
   *   get:
   *     summary: Get an expense by ID
   *     tags: [Expenses]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Expense ID
   *     responses:
   *       200:
   *         description: Expense details
   *       404:
   *         description: Expense not found
   *       500:
   *         description: Internal server error
   */
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

  /**
   * @swagger
   * /expenses:
   *   get:
   *     summary: List expenses
   *     tags: [Expenses]
   *     parameters:
   *       - in: query
   *         name: propertyId
   *         schema:
   *           type: string
   *         description: Filter by Property ID
   *       - in: query
   *         name: unitId
   *         schema:
   *           type: string
   *         description: Filter by Unit ID
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Filter by start date
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Filter by end date
   *     responses:
   *       200:
   *         description: List of expenses
   *       500:
   *         description: Internal server error
   */
  async getAllExpenses(req: Request, res: Response): Promise<void> {
    try {
      const filters: ExpenseFilters = req.query as any;
      const expenses = await this.listExpensesQuery.execute(filters);
      res.json({ success: true, data: expenses });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  /**
   * @swagger
   * /expenses/property/{propertyId}:
   *   get:
   *     summary: Get expenses by Property ID
   *     tags: [Expenses]
   *     parameters:
   *       - in: path
   *         name: propertyId
   *         required: true
   *         schema:
   *           type: string
   *         description: Property ID
   *     responses:
   *       200:
   *         description: List of expenses for the property
   *       500:
   *         description: Internal server error
   */
  async getExpensesByProperty(req: Request, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;
      const expenses = await this.getExpensesByPropertyQuery.execute(propertyId);
      res.json({ success: true, data: expenses });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  /**
   * @swagger
   * /expenses/unit/{unitId}:
   *   get:
   *     summary: Get expenses by Unit ID
   *     tags: [Expenses]
   *     parameters:
   *       - in: path
   *         name: unitId
   *         required: true
   *         schema:
   *           type: string
   *         description: Unit ID
   *     responses:
   *       200:
   *         description: List of expenses for the unit
   *       500:
   *         description: Internal server error
   */
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
