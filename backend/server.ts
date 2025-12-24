import { config } from '@/shared/config/env';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Pool } from 'pg';
import { logger } from '@/shared/utils/logger.js';
import { requestLoggingMiddleware, requestIdMiddleware } from '@/shared/middleware/loggingMiddleware.js';
import { errorHandler, notFoundHandler, setupProcessErrorHandlers } from '@/shared/middleware/errorHandler.js';
import { globalLimiter } from '@/shared/middleware/rateLimitMiddleware';
import swaggerUi from 'swagger-ui-express';
import { specs } from './src/shared/config/swagger/index.js';
import { swaggerUiOptions } from './src/shared/config/swagger/index.js';
import { PropertyModule } from '@/features/properties/property/index.js';
import { UnitModule } from '@/features/properties/unit/unit.module.js';
import { TenantModule } from '@/features/tenants/tenant/index.js';
import { UnitTenantModule } from '@/features/tenants/unit-tenant/unit-tenant.module.js';
import { MeterModule } from '@/features/properties/meter/meter.module.js';
import { authMiddleware } from '@/shared/middleware/authMiddleware';
import { organizationMiddleware } from '@/shared/middleware/OrganizationMiddleware.js';
import { createMultiTenantPool } from '@/shared/infrastructure/database/MultiTenantPool.js';
import { EventBus } from '@/shared/infrastructure/event-bus/EventBus';

// Legacy Imports (Moved to Features)
import { ReceiptController } from '@/features/finance/receipt/api/ReceiptController';
import { createReceiptRoutes } from '@/features/finance/receipt/api/receipt.routes';
import { ReceiptService } from '@/features/finance/receipt/core/services/ReceiptService';
import { ReceiptRepository } from '@/features/finance/receipt/data/repository/ReceiptRepository';

import { ReceiptTemplateController } from '@/features/finance/receipt-template/api/ReceiptTemplateController';
import { createReceiptTemplateRoutes } from '@/features/finance/receipt-template/api/receipt-template.routes';
import { ReceiptTemplateService } from '@/features/finance/receipt-template/core/services/ReceiptTemplateService';
import { ReceiptTemplateRepository } from '@/features/finance/receipt-template/data/repository/ReceiptTemplateRepository';
import { TemplateController } from '@/features/finance/receipt-template/api/TemplateController';
import createTemplateRoutes from '@/features/finance/receipt-template/api/template.routes';

import { UnitUtilityController } from '@/features/properties/unit-utility/api/UnitUtilityController';
import { createUnitUtilityRoutes } from '@/features/properties/unit-utility/api/unit-utility.routes';
import { UnitUtilityService } from '@/features/properties/unit-utility/core/services/UnitUtilityService';
import { UnitUtilityRepository } from '@/features/properties/unit-utility/data/repository/UnitUtilityRepository';

import { BulkOperationsController } from '@/features/admin/bulk-operations/api/BulkOperationsController';
import { createBulkOperationsRoutes } from '@/features/admin/bulk-operations/api/bulk-operations.routes';
import { BulkOperationsService } from '@/features/admin/bulk-operations/core/services/BulkOperationsService';

// Legacy Repositories & Services (for DI)
import { PropertyRepository } from '@/features/properties/property/data/repository/PropertyRepository';
import { UserRepository } from '@/features/auth/user/data/UserRepository';
import { TenantRepository } from '@/features/tenants/tenant/data/repository/TenantRepository';
import { LeaseRepository } from '@/features/leases/data/LeaseRepository';
import { RentPaymentRepository } from '@/features/finance/rent-payment/data/RentPaymentRepository';
import { RentTransactionRepository } from '@/features/finance/rent-transaction/data/RentTransactionRepository';
import { RentTransactionMeterReadingRepository } from '@/features/finance/rent-transaction/data/RentTransactionMeterReadingRepository';
import { UnitRepository } from '@/features/properties/unit/data/repository/UnitRepository';

import { UserService } from '@/features/auth/user/core/UserService';
import { RentPaymentService } from '@/features/finance/rent-payment/core/RentPaymentService';
import { RentTransactionService } from '@/features/finance/rent-transaction/core/RentTransactionService';

// New Feature Services & Repositories (Migrated from Legacy)
import { MeterRepository } from '@/features/properties/meter/data/repository/MeterRepository';
import { MeterReadingRepository } from '@/features/properties/meter/data/repository/MeterReadingRepository';
import { MeterService } from '@/features/properties/meter/core/services/MeterService';
import { MeterReadingService } from '@/features/properties/meter/core/services/MeterReadingService';
import { PropertyFileRepository } from '@/features/properties/property/data/repository/PropertyFileRepository';
import { PropertyReceiptTemplateRepository } from '@/features/properties/property/data/repository/PropertyReceiptTemplateRepository';
import { PropertyFileService } from '@/features/properties/property/core/services/PropertyFileService';
import { PropertyReceiptTemplateService } from '@/features/properties/property/core/services/PropertyReceiptTemplateService';

import { PropertyController } from '@/features/properties/property/api/PropertyController.js';
import { PropertyFileController } from '@/features/properties/property/api/PropertyFileController.js';
import { PropertyReceiptTemplateController } from '@/features/properties/property/api/PropertyReceiptTemplateController.js';
import { GetPropertiesUseCase } from '@/features/properties/property/core/use-cases/GetProperties.usecase.js';
import { GetPropertyByIdUseCase } from '@/features/properties/property/core/use-cases/GetPropertyById.usecase.js';
import { CreatePropertyUseCase } from '@/features/properties/property/core/use-cases/CreateProperty.usecase.js';
import { UpdatePropertyUseCase } from '@/features/properties/property/core/use-cases/UpdateProperty.usecase.js';
import { DeletePropertyUseCase } from '@/features/properties/property/core/use-cases/DeleteProperty.usecase.js';
import { PropertyRepository as NewPropertyRepository } from '@/features/properties/property/data/repository/PropertyRepository.js';

import { FileStorageModule } from '@/features/files/file-storage/file-storage.module';
import { ExpenseModule } from '@/features/finance/expense/expense.module';
import { AuthModule } from '@/features/auth/auth/auth.module';
import { UserModule } from '@/features/auth/user/user.module';
import { RentPaymentModule } from '@/features/finance/rent-payment/rent-payment.module';
import { RentTransactionModule } from '@/features/finance/rent-transaction/rent-transaction.module';
import { createLeaseRoutes } from '@/features/leases/api/lease.routes';

// Setup global process error handlers
setupProcessErrorHandlers();

logger.info('🚀 Starting Asset Management Platform Backend...', {
  nodeEnv: config.env,
  emailProvider: config.email.provider,
  hasResendApiKey: !!config.email.resendApiKey,
  dbConfig: config.db.url ? 'url' : 'env_vars',
});

const startServer = async () => {
  const mainDbConfig = config.db.url
    ? { connectionString: config.db.url }
    : {
        host: config.db.host,
        port: config.db.port,
        database: config.db.name,
        user: config.db.user,
        password: config.db.password,
      };

  const mainPool = createMultiTenantPool();

  const filesDbConfig = config.db.filesUrl
    ? { connectionString: config.db.filesUrl }
    : {
        host: config.db.host,
        port: config.db.port,
        database: config.db.filesName || config.db.name, // Fallback to main DB if not specified
        user: config.db.user,
        password: config.db.password,
      };

  const filesPool = new Pool(filesDbConfig);

  // --- Dependency Injection (Manual) ---

  // Repositories
  const userRepository = new UserRepository(mainPool);
  const propertyRepository = new PropertyRepository(mainPool);
  const tenantRepository = new TenantRepository(mainPool);
  const leaseRepository = new LeaseRepository(mainPool);
  const rentPaymentRepository = new RentPaymentRepository(mainPool);
  const rentTransactionRepository = new RentTransactionRepository(mainPool);
  const meterRepository = new MeterRepository(mainPool);
  const meterReadingRepository = new MeterReadingRepository(mainPool);
  const transactionMeterReadingRepository = new RentTransactionMeterReadingRepository(mainPool);
  const propertyFileRepository = new PropertyFileRepository(filesPool);
  const propertyReceiptTemplateRepository = new PropertyReceiptTemplateRepository(mainPool);
  const unitRepository = new UnitRepository(mainPool);
  const receiptRepository = new ReceiptRepository(mainPool);
  const receiptTemplateRepository = new ReceiptTemplateRepository(mainPool);
  const unitUtilityRepository = new UnitUtilityRepository(mainPool);

  // Services
  const eventBus = EventBus.getInstance();
  const userService = new UserService(userRepository);
  const meterService = new MeterService(meterRepository);
  const meterReadingService = new MeterReadingService(meterReadingRepository, meterRepository);
  const propertyFileService = new PropertyFileService(propertyFileRepository);
  const propertyReceiptTemplateService = new PropertyReceiptTemplateService(propertyReceiptTemplateRepository);
  
  const receiptTemplateService = new ReceiptTemplateService(receiptTemplateRepository, propertyRepository);
  
  const rentPaymentService = new RentPaymentService(
    rentPaymentRepository,
    leaseRepository,
    tenantRepository,
    eventBus
  );

  const receiptService = new ReceiptService(
    receiptRepository,
    rentTransactionRepository,
    rentPaymentRepository,
    leaseRepository,
    propertyRepository,
    tenantRepository,
    userRepository,
    receiptTemplateService
  );

  const unitUtilityService = new UnitUtilityService(unitUtilityRepository, meterService);

  const rentTransactionService = new RentTransactionService(
    rentTransactionRepository,
    leaseRepository,
    tenantRepository,
    propertyRepository,
    userRepository,
    transactionMeterReadingRepository,
    eventBus
  );

  const bulkOperationsService = new BulkOperationsService(
    rentTransactionService,
    receiptService,
    propertyRepository,
    tenantRepository,
    unitRepository,
    userRepository,
    leaseRepository,
    rentTransactionRepository,
    rentPaymentRepository
  );

  // Initialize file storage service
  const fileStorageModule = new FileStorageModule(filesPool, authMiddleware(userService));
  const fileStorageService = fileStorageModule.service;

  // Initialize Property Feature
  const newPropertyRepository = new NewPropertyRepository(mainPool);
  const getPropertiesUseCase = new GetPropertiesUseCase(newPropertyRepository);
  const getPropertyByIdUseCase = new GetPropertyByIdUseCase(newPropertyRepository);
  const createPropertyUseCase = new CreatePropertyUseCase(newPropertyRepository);
  const updatePropertyUseCase = new UpdatePropertyUseCase(newPropertyRepository);
  const deletePropertyUseCase = new DeletePropertyUseCase(newPropertyRepository);

  // Create controllers with injected services
  const propertyController = new PropertyController(
    getPropertiesUseCase,
    getPropertyByIdUseCase,
    createPropertyUseCase,
    updatePropertyUseCase,
    deletePropertyUseCase
  );
  
  const propertyFileController = new PropertyFileController(
    getPropertyByIdUseCase,
    fileStorageService,
    propertyFileService
  );
  
  const propertyReceiptTemplateController = new PropertyReceiptTemplateController(
    getPropertyByIdUseCase,
    propertyReceiptTemplateService
  );

  const receiptController = new ReceiptController(receiptService);
  const receiptTemplateController = new ReceiptTemplateController(receiptTemplateService);
  const unitUtilityController = new UnitUtilityController(unitUtilityService);
  const bulkOperationsController = new BulkOperationsController(bulkOperationsService);

  const app = express();

  // Global Rate limiting
  app.use(globalLimiter);

  // Security and CORS middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for Swagger UI to work
  }));
  // CORS configuration: read allowed origins from ENV or fallback to local defaults
  const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174,http://localhost:3000,http://localhost:5000,http://localhost:5001';
  const allowedOrigins = rawOrigins.split(',').map(s => s.trim()).filter(Boolean);

  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow non-browser requests (curl, server-to-server) where origin is undefined
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // In development, also accept common localhost/127.0.0.1 origins that may not be present
      // in the explicit allowlist to make local dev less brittle.
      if (config.env === 'development') {
        try {
          const parsed = new URL(origin);
          const host = parsed.hostname;
          const devHosts = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0']);
          if (devHosts.has(host)) {
            console.info('CORS allowed local dev origin:', origin);
            return callback(null, true);
          }
        } catch (e) {
          // If origin can't be parsed, fall through to block with helpful log
        }
      }

      // Not allowed - provide a helpful error
      const err = new Error(`CORS policy: Origin ${origin} not allowed`);
      // Log for debugging
      console.warn('CORS blocked origin:', origin, 'Allowed:', allowedOrigins);
      return callback(err);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Pragma', 'X-CSRF-Token', 'X-Request-ID', 'Accept'] ,
    optionsSuccessStatus: 200,
  };

  app.use(cors(corsOptions as any));
  // Ensure preflight requests are handled
  app.options('*', cors(corsOptions as any));
  app.use(express.json());

  // Serve static PDF files
  app.use('/invoices', express.static('public/invoices'));
  app.use('/api/receipts', express.static('public/receipts'));

  // Expose raw OpenAPI/Swagger JSON for external tools and direct access
  app.get('/openapi.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    // Prevent caching in dev; consumers can cache in prod as needed
    res.setHeader('Cache-Control', 'no-store');
    res.json(specs);
  });

  // Logging middleware (must be before routes)
  app.use(requestIdMiddleware);
  app.use(requestLoggingMiddleware);
  app.use(organizationMiddleware);

  app.use('/api-docs', swaggerUi.serve as any, swaggerUi.setup(specs, swaggerUiOptions) as any);

  app.get('/', (req, res) => {
    res.json({ message: 'Property Management API' });
  });

  app.get('/api/health', async (req, res) => {
    try {
      // Test database connections
      await mainPool.query('SELECT 1');
      await filesPool.query('SELECT 1');
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        databases: {
          main: 'connected',
          files: 'connected'
        }
      });
    } catch (error) {
      logger.error('Health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // API Versioning - v1 Router
  const v1Router = express.Router();

  // Mount routes to v1 router
  v1Router.use('/properties', PropertyModule.create(mainPool, userService, { fileController: propertyFileController, receiptTemplateController: propertyReceiptTemplateController }));
  v1Router.use('/auth', new AuthModule(mainPool).router);
  v1Router.use('/users', new UserModule(mainPool).router);
  v1Router.use('/tenants', TenantModule.create(mainPool, userService));
  v1Router.use('/units', UnitModule.create(mainPool, userService));
  v1Router.use('/units', UnitModule.create(mainPool, userService));
  v1Router.use('/unit-tenants', UnitTenantModule.create(mainPool, userService));
  // Mount lease routes
  v1Router.use('/leases', createLeaseRoutes(authMiddleware(userService) as any));
  v1Router.use('/rent-payments', new RentPaymentModule(mainPool, EventBus.getInstance()).router);
  v1Router.use('/rent-transactions', new RentTransactionModule(mainPool, EventBus.getInstance()).router);
  v1Router.use('/meters', MeterModule.create(mainPool, userService));
  v1Router.use('/receipts', createReceiptRoutes(receiptController, userService));
  v1Router.use('/receipt-templates', createReceiptTemplateRoutes(receiptTemplateController, userService));
  v1Router.use('/', createTemplateRoutes(mainPool, userService));
  v1Router.use('/', createUnitUtilityRoutes(unitUtilityController, userService));
  v1Router.use('/expenses', new ExpenseModule(mainPool).getRoutes(authMiddleware(userService)));
  v1Router.use('/files', fileStorageModule.router);
  v1Router.use('/bulk', createBulkOperationsRoutes(bulkOperationsController, userService));

  // Mount v1 router
  app.use('/api/v1', v1Router);
  
  // Legacy support: Mount v1 router at /api as well to maintain backward compatibility during migration
  app.use('/api', v1Router);

  // Error handling middleware (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = config.port;
  app.listen(PORT, () => {
    logger.info(`✅ Server is running on port ${PORT}`, {
      port: PORT,
      environment: config.env,
      swaggerUrl: `http://localhost:${PORT}/api-docs`,
    });
  });
};

// Start the server
startServer().catch((error) => {
  logger.error('❌ Failed to start server:', error);
  process.exit(1);
});
