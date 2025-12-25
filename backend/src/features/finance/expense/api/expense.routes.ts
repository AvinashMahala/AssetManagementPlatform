import { Router, RequestHandler } from 'express';
import { ExpenseController } from './ExpenseController';

export const createExpenseRoutes = (expenseController: ExpenseController, authMiddleware: RequestHandler) => {
  const router = Router();

  router.use(authMiddleware);

  router.post('/', (req, res) => expenseController.createExpense(req, res));
  router.get('/', (req, res) => expenseController.getAllExpenses(req, res));
  router.get('/:id', (req, res) => expenseController.getExpenseById(req, res));
  router.put('/:id', (req, res) => expenseController.updateExpense(req, res));
  router.delete('/:id', (req, res) => expenseController.deleteExpense(req, res));
  
  router.get('/property/:propertyId', (req, res) => expenseController.getExpensesByProperty(req, res));
  router.get('/unit/:unitId', (req, res) => expenseController.getExpensesByUnit(req, res));

  return router;
};
