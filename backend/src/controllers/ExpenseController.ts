import { Request, Response } from 'express';
import { IExpenseService } from '../interfaces/services/IExpenseService';
import { ExpenseInput, ExpenseFilters } from '../models/Expense';
import { createModuleLogger, PerformanceLogger } from '../utils/logger.js';
import { AppError } from '../middlewares/errorHandler.js';

const logger = createModuleLogger('ExpenseController');

export class ExpenseController {
  constructor(private expenseService: IExpenseService) {}

  async getAllExpenses(req: Request, res: Response): Promise<void> {
    const perfLogger = new PerformanceLogger('getAllExpenses', {
      userId: (req as any).user?.id,
    });

    try {
      logger.info('Fetching all expenses');
      const expenses = await this.expenseService.getAllExpensesWithDetails();

      logger.info('Successfully fetched expenses', { count: expenses.length });
      perfLogger.end({ count: expenses.length });

      res.json({
        success: true,
        data: expenses
      });
    } catch (error) {
      logger.error('Failed to fetch expenses', error);
      perfLogger.endWithError(error as Error);

      throw new AppError('Failed to fetch expenses', 500);
    }
  }

  async getExpenseById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const perfLogger = new PerformanceLogger('getExpenseById', {
      expenseId: id,
      userId: (req as any).user?.id,
    });

    try {
      logger.info('Fetching expense by ID', { expenseId: id });
      const expense = await this.expenseService.getExpenseById(id);

      if (!expense) {
        logger.warn('Expense not found', { expenseId: id });
        perfLogger.end({ found: false });

        throw new AppError('Expense not found', 404, true, 'EXPENSE_NOT_FOUND');
      }

      logger.info('Successfully fetched expense', { expenseId: id });
      perfLogger.end({ found: true });

      res.json({
        success: true,
        data: expense
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error('Failed to fetch expense by ID', error, { expenseId: id });
      perfLogger.endWithError(error as Error);

      throw new AppError('Failed to fetch expense', 500);
    }
  }

  async getExpensesByProperty(req: Request, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;
      const expenses = await this.expenseService.getExpensesByProperty(propertyId);

      res.json({
        success: true,
        data: expenses
      });
    } catch (error) {
      console.error('Error fetching expenses by property:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch expenses'
      });
    }
  }

  async getExpensesByUnit(req: Request, res: Response): Promise<void> {
    try {
      const { unitId } = req.params;
      const expenses = await this.expenseService.getExpensesByUnit(unitId);

      res.json({
        success: true,
        data: expenses
      });
    } catch (error) {
      console.error('Error fetching expenses by unit:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch expenses'
      });
    }
  }

  async getActiveExpensesByProperty(req: Request, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;
      const expenses = await this.expenseService.getActiveExpensesByProperty(propertyId);

      res.json({
        success: true,
        data: expenses
      });
    } catch (error) {
      console.error('Error fetching active expenses by property:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch active expenses'
      });
    }
  }

  async getActiveExpensesByUnit(req: Request, res: Response): Promise<void> {
    try {
      const { unitId } = req.params;
      const expenses = await this.expenseService.getActiveExpensesByUnit(unitId);

      res.json({
        success: true,
        data: expenses
      });
    } catch (error) {
      console.error('Error fetching active expenses by unit:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch active expenses'
      });
    }
  }

  async getExpensesWithFilters(req: Request, res: Response): Promise<void> {
    try {
      const filters: ExpenseFilters = req.query;
      const expenses = await this.expenseService.getExpensesWithFilters(filters);

      res.json({
        success: true,
        data: expenses
      });
    } catch (error) {
      console.error('Error fetching expenses with filters:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch expenses'
      });
    }
  }

  async createExpense(req: Request, res: Response): Promise<void> {
    try {
      const expenseData: ExpenseInput = req.body;
      const userId = (req as any).user?.id;

      const expense = await this.expenseService.createExpense(expenseData, userId);

      res.status(201).json({
        success: true,
        data: expense,
        message: 'Expense created successfully'
      });
    } catch (error) {
      console.error('Error creating expense:', error);
      const statusCode = error instanceof Error && error.message.includes('required') ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create expense'
      });
    }
  }

  async updateExpense(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: Partial<ExpenseInput> = req.body;
      const userId = (req as any).user?.id;

      const expense = await this.expenseService.updateExpense(id, updateData, userId);

      if (!expense) {
        res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
        return;
      }

      res.json({
        success: true,
        data: expense,
        message: 'Expense updated successfully'
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      const statusCode = error instanceof Error && error.message.includes('must be provided') ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update expense'
      });
    }
  }

  async deleteExpense(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.expenseService.deleteExpense(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Expense deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete expense'
      });
    }
  }

  async updateExpenseStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = (req as any).user?.id;

      if (!status) {
        res.status(400).json({
          success: false,
          message: 'Status is required'
        });
        return;
      }

      let updated: boolean;
      if (status === 'archived') {
        updated = await this.expenseService.archiveExpense(id, userId);
      } else if (status === 'active') {
        updated = await this.expenseService.activateExpense(id, userId);
      } else {
        res.status(400).json({
          success: false,
          message: 'Invalid status. Use "active" or "archived"'
        });
        return;
      }

      if (!updated) {
        res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Expense status updated successfully'
      });
    } catch (error) {
      console.error('Error updating expense status:', error);
      const statusCode = error instanceof Error && error.message.includes('Invalid status') ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update expense status'
      });
    }
  }

  async getExpenseStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { propertyId } = req.query;

      if (!propertyId) {
        res.status(400).json({
          success: false,
          message: 'Property ID is required'
        });
        return;
      }

      const statistics = await this.expenseService.getExpenseStatistics(propertyId as string);

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error fetching expense statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch expense statistics'
      });
    }
  }
}