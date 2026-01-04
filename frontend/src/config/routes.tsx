// Import route types
import type { RouteConfig } from './routeTypes';

// Import modular route configurations
import { authRoutes } from './routes/authRoutes';
import { dashboardRoutes } from './routes/dashboardRoutes';
import { propertiesRoutes } from './routes/propertiesRoutes';
import { tenantsRoutes } from './routes/tenantsRoutes';
import { unitsRoutes } from './routes/unitsRoutes';
import { leasesRoutes } from './routes/leasesRoutes';
import { paymentsRoutes } from './routes/paymentsRoutes';
import { expensesRoutes } from './routes/expensesRoutes';
import { filesRoutes } from './routes/filesRoutes';
import { metersRoutes } from './routes/metersRoutes';
import { templatesRoutes } from './routes/templatesRoutes';
import { rentCollectionRoutes } from './routes/rentCollectionRoutes';
import { rentTransactionsRoutes } from './routes/rentTransactionsRoutes';
import { bulkOperationsRoutes } from './routes/bulkOperationsRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { utilityTypesRoutes } from './routes/utilityTypesRoutes';
import { utilitySubscriptionsRoutes } from './routes/utilitySubscriptionsRoutes';
import { tariffsRoutes } from './routes/tariffsRoutes';
import { meterAllocationsRoutes } from './routes/meterAllocationsRoutes';
import { commonRoutes } from './routes/commonRoutes';

// Combine all route configurations
export const routes: RouteConfig[] = [
  ...authRoutes,
  ...dashboardRoutes,
  ...propertiesRoutes,
  ...tenantsRoutes,
  ...unitsRoutes,
  ...leasesRoutes,
  ...paymentsRoutes,
  ...expensesRoutes,
  ...filesRoutes,
  ...metersRoutes,
  ...templatesRoutes,
  ...rentCollectionRoutes,
  ...rentTransactionsRoutes,
  ...bulkOperationsRoutes,
  ...adminRoutes,
  ...utilityTypesRoutes,
  ...utilitySubscriptionsRoutes,
  ...tariffsRoutes,
  ...meterAllocationsRoutes,
  ...commonRoutes,
];