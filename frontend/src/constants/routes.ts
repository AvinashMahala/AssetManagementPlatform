// Route path constants for reusability and maintainability
export const ROUTE_PATHS = {
  // Auth
  LOGIN: '/login',
  VERIFY_EMAIL: '/verify-email',
  VERIFY_PHONE: '/verify-phone',
  PROFILE: '/profile',

  // Dashboard
  DASHBOARD: '/dashboard',
  NAVIGATION_CONFIG: '/navigation-config',

  // Properties
  PROPERTIES: '/properties',
  PROPERTIES_CREATE_TABBED: '/properties/create-tabbed',
  PROPERTY_DETAIL: '/properties/:id',
  PROPERTY_DASHBOARD: '/properties/:id/dashboard',
  PROPERTY_EDIT: '/properties/:id/edit',
  PROPERTY_TEMPLATE_CUSTOMIZATION: '/properties/:propertyId/template-customization',

  // Tenants
  TENANTS: '/tenants',
  TENANTS_CREATE: '/tenants/create',
  TENANTS_CREATE_TABBED: '/tenants/create-tabbed',
  TENANT_DETAIL: '/tenants/:id',
  TENANT_DASHBOARD: '/tenants/:id/dashboard',
  TENANT_EDIT: '/tenants/:id/edit',

  // Units
  UNITS: '/units',
  UNITS_CREATE: '/units/create',
  UNITS_CREATE_TABBED: '/units/create-tabbed',
  UNIT_DETAIL: '/units/:id',
  UNIT_DASHBOARD: '/units/:id/dashboard',
  UNIT_EDIT: '/units/:id/edit',

  // Leases
  LEASES: '/leases',
  LEASES_CREATE: '/leases/create',
  LEASES_CREATE_TABBED: '/leases/create-tabbed',
  LEASE_DETAIL: '/leases/:id',
  LEASE_EDIT: '/leases/:id/edit',

  // Payments
  PAYMENTS: '/payments',
  PAYMENTS_CREATE: '/payments/create',
  PAYMENTS_CREATE_TABBED: '/payments/create-tabbed',
  PAYMENT_DETAIL: '/payments/:id',
  PAYMENT_EDIT: '/payments/:id/edit',

  // Expenses
  EXPENSES: '/expenses',
  EXPENSES_CREATE: '/expenses/create',
  EXPENSES_CREATE_TABBED: '/expenses/create-tabbed',
  EXPENSE_DETAIL: '/expenses/:id',
  EXPENSE_EDIT: '/expenses/:id/edit',

  // Files
  FILES: '/files',

  // Meters
  METERS: '/meters',
  METERS_CREATE: '/meters/create',
  METERS_CREATE_TABBED: '/meters/create-tabbed',
  METER_DETAIL: '/meters/:id',
  METER_EDIT: '/meters/:id/edit',
  METER_READING_CREATE: '/meters/:id/readings/create',

  // Templates
  TEMPLATES: '/templates',
  TEMPLATE_EDITOR: '/templates/:templateId/editor',

  // Rent Collection
  PROPERTY_RENT_COLLECTION: '/properties/:propertyId/rent-collection',
  PROPERTY_RENT_COLLECTION_MONTHLY_SUMMARY: '/properties/:propertyId/rent-collection/monthly-summary',
  RENT_COLLECTION_WORKFLOW_DASHBOARD: '/rent-collection/workflow-dashboard',
  UNIT_COLLECT_RENT: '/properties/:propertyId/units/:unitId/collect-rent',

  // Rent Transactions
  RENT_TRANSACTION_INVOICE: '/rent-transactions/:transactionId/invoice',
  RENT_TRANSACTION_RECORD_PAYMENT: '/rent-transactions/:transactionId/record-payment',
  RENT_TRANSACTION_RECEIPT: '/rent-transactions/:transactionId/receipt',

  // Bulk Operations
  BULK_OPERATIONS: '/bulk-operations',

  // Admin
  ADMIN: '/admin/*',

  // Defaults
  ROOT: '/',
  WILDCARD: '*',
} as const;