import { lazy } from 'react';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';

// Lazy-loaded rent transaction components
const RentTransactionInvoicePage = lazy(() => import('../../pages/rentTransactions/RentTransactionInvoicePage').then(module => ({ default: module.RentTransactionInvoicePage })));
const RentTransactionRecordPaymentPage = lazy(() => import('../../pages/rentTransactions/RentTransactionRecordPaymentPage').then(module => ({ default: module.RentTransactionRecordPaymentPage })));
const RentTransactionReceiptPage = lazy(() => import('../../pages/rentTransactions/RentTransactionReceiptPage').then(module => ({ default: module.RentTransactionReceiptPage })));

export const rentTransactionsRoutes: RouteConfig[] = [
  {
    path: ROUTE_PATHS.RENT_TRANSACTION_INVOICE,
    element: <RentTransactionInvoicePage />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.RENT_TRANSACTION_RECORD_PAYMENT,
    element: <RentTransactionRecordPaymentPage />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.RENT_TRANSACTION_RECEIPT,
    element: <RentTransactionReceiptPage />,
    isProtected: true,
  },
];