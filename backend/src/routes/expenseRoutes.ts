import { Router } from 'express';
import { ExpenseController } from '../controllers/ExpenseController';
import { conditionalAuth } from '../middlewares/authMiddleware';
import { IUserService } from '../interfaces/services/IUserService';

export const createExpenseRoutes = (controller: ExpenseController, userService: IUserService) => {
  const router = Router();

  // Apply conditional auth to all expense routes
  const auth = conditionalAuth(userService);

  // Expense CRUD routes
  router.get('/', auth, controller.getAllExpenses.bind(controller));
  router.get('/:id', auth, controller.getExpenseById.bind(controller));
  router.get('/property/:propertyId', auth, controller.getExpensesByProperty.bind(controller));
  router.get('/unit/:unitId', auth, controller.getExpensesByUnit.bind(controller));
  router.get('/active/property/:propertyId', auth, controller.getActiveExpensesByProperty.bind(controller));
  router.get('/active/unit/:unitId', auth, controller.getActiveExpensesByUnit.bind(controller));
  router.get('/filter/search', auth, controller.getExpensesWithFilters.bind(controller));

  // Expense management routes
  router.post('/', auth, controller.createExpense.bind(controller));
  router.put('/:id', auth, controller.updateExpense.bind(controller));
  router.delete('/:id', auth, controller.deleteExpense.bind(controller));

  // Expense status routes
  router.patch('/:id/status', auth, controller.updateExpenseStatus.bind(controller));

  // Expense statistics routes
  router.get('/statistics/overview', auth, controller.getExpenseStatistics.bind(controller));

  return router;
};