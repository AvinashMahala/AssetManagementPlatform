import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';
import { AppLayout } from '../../components/layout/AppLayout';

// Lazy-loaded payment components
const PaymentCreatePageTabbedEnhanced = lazy(() => import('../../features/finance/pages/PaymentCreatePageTabbedEnhanced/PaymentCreatePageTabbedEnhanced'));
const PaymentDetailPage = lazy(() => import('../../features/finance/pages/PaymentDetailPage/PaymentDetailPage').then(module => ({ default: module.PaymentDetailPage })));
const PaymentEditPage = lazy(() => import('../../features/finance/pages/PaymentEditPage/PaymentEditPage').then(module => ({ default: module.PaymentEditPage })));
const PaymentListPageEnhanced = lazy(() => import('../../features/finance/pages/PaymentListPageEnhanced/PaymentListPageEnhanced'));

export const paymentsRoutes: RouteConfig[] = [
  {
    path: ROUTE_PATHS.PAYMENTS,
    element: <PaymentListPageEnhanced />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.PAYMENTS_CREATE,
    element: <Navigate to={ROUTE_PATHS.PAYMENTS_CREATE_TABBED} replace />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.PAYMENTS_CREATE_TABBED,
    element: <PaymentCreatePageTabbedEnhanced />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.PAYMENT_DETAIL,
    element: <AppLayout><PaymentDetailPage /></AppLayout>,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.PAYMENT_EDIT,
    element: <PaymentEditPage />,
    isProtected: true,
  },
];