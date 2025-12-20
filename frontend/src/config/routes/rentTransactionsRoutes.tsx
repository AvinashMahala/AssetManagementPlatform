import { lazy } from 'react';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';

// Lazy-loaded rent transaction components
const RentTransactionInvoicePage = lazy(() => import('../../features/finance/rentTransactions/Invoice/InvoicePage').then(module => ({ default: module.InvoicePage })));
const RentTransactionRecordPaymentPage = lazy(() => import('../../features/finance/rentTransactions/RecordPayment/RecordPaymentPage').then(module => ({ default: module.RecordPaymentPage })));
const RentTransactionReceiptPage = lazy(() => import('../../features/finance/rentTransactions/Receipt/ReceiptPage').then(module => ({ default: module.ReceiptPage })));

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