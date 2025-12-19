import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';

// Lazy-loaded expense components
const ExpenseListPageEnhanced = lazy(() => import('../../features/finance/pages/Expenses/ExpenseListPageEnhanced'));
const ExpenseCreatePageTabbedEnhanced = lazy(() => import('../../features/finance/pages/Expenses/ExpenseCreatePageTabbedEnhanced'));
const ExpenseDetailPage = lazy(() => import('../../features/finance/pages/Expenses/ExpenseDetailPage'));
const ExpenseEditPage = lazy(() => import('../../features/finance/pages/Expenses/ExpenseEditPage').then(module => ({ default: module.ExpenseEditPage })));

export const expensesRoutes: RouteConfig[] = [
  {
    path: ROUTE_PATHS.EXPENSES,
    element: <ExpenseListPageEnhanced />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.EXPENSES_CREATE,
    element: <Navigate to={ROUTE_PATHS.EXPENSES_CREATE_TABBED} replace />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.EXPENSES_CREATE_TABBED,
    element: <ExpenseCreatePageTabbedEnhanced />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.EXPENSE_DETAIL,
    element: <ExpenseDetailPage />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.EXPENSE_EDIT,
    element: <ExpenseEditPage />,
    isProtected: true,
  },
];