import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try to load .env from current directory first (for Docker/local), then parent (original setup)
const localEnv = path.resolve(process.cwd(), '.env');
const parentEnv = path.resolve(process.cwd(), '../.env');

if (fs.existsSync(localEnv)) {
  dotenv.config({ path: localEnv });
} else {
  dotenv.config({ path: parentEnv });
}

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Pool } from 'pg';
import { logger } from './src/shared/utils/logger.js';
import { requestLoggingMiddleware, requestIdMiddleware } from './src/shared/middleware/loggingMiddleware.js';
import { errorHandler, notFoundHandler, setupProcessErrorHandlers } from './src/shared/middleware/errorHandler.js';
import swaggerUi from 'swagger-ui-express';
import { specs } from './src/shared/config/swagger/index.js';
import { swaggerUiOptions } from './src/shared/config/swagger/index.js';
import { createLeaseRoutes as createNewLeaseRoutes } from '@/features/leases/api/lease.routes';
import { PropertyModule } from '@/features/properties/property/index.js';
import { UnitModule } from '@/features/properties/unit/unit.module.js';
import { authMiddleware } from '@/shared/middleware/authMiddleware';
// import { initializeDatabase } from './src/shared/config/database/init/index.js';
import { LeaseController } from './src/controllers/leaseController.js';
import { RentPaymentController } from './src/controllers/RentPaymentController.js';
import { createRentPaymentRoutes } from './src/routes/rentPaymentRoutes.js';
import { RentTransactionController } from './src/controllers/RentTransactionController.js';
import { createRentTransactionRoutes } from './src/routes/rentTransactionRoutes.js';
import { MeterController } from './src/controllers/MeterController.js';
import { createMeterRoutes } from './src/routes/meterRoutes.js';
import { ReceiptController } from './src/controllers/ReceiptController.js';
import { createReceiptRoutes } from './src/routes/receiptRoutes.js';
import { ReceiptTemplateController } from './src/controllers/ReceiptTemplateController.js';
import { createReceiptTemplateRoutes } from './src/routes/receiptTemplateRoutes.js';
import createTemplateRoutes from './src/routes/templateRoutes.js';
import { PropertyController } from '@/features/properties/property/api/PropertyController.js';
import { PropertyFileController } from '@/features/properties/property/api/PropertyFileController.js';
import { PropertyReceiptTemplateController } from '@/features/properties/property/api/PropertyReceiptTemplateController.js';
import { GetPropertiesUseCase } from '@/features/properties/property/core/use-cases/GetProperties.usecase.js';
import { GetPropertyByIdUseCase } from '@/features/properties/property/core/use-cases/GetPropertyById.usecase.js';
import { CreatePropertyUseCase } from '@/features/properties/property/core/use-cases/CreateProperty.usecase.js';
import { UpdatePropertyUseCase } from '@/features/properties/property/core/use-cases/UpdateProperty.usecase.js';
import { DeletePropertyUseCase } from '@/features/properties/property/core/use-cases/DeleteProperty.usecase.js';
import { PropertyRepository as NewPropertyRepository } from '@/features/properties/property/data/repository/PropertyRepository.js';
import { UserController } from './src/controllers/userController.js';
import { TenantController } from './src/controllers/TenantController.js';
import { UnitController } from './src/controllers/UnitController.js';
import { UnitTenantController } from './src/controllers/UnitTenantController.js';
import { createAuthRoutes } from './src/routes/authRoutes.js';
import { createUserRoutes } from './src/routes/userRoutes.js';
import { createTenantRoutes } from './src/routes/tenantRoutes.js';
import { createUnitRoutes } from './src/routes/unitRoutes.js';
import { createUnitTenantRoutes } from './src/routes/unitTenantRoutes.js';
import { UnitUtilityController } from './src/controllers/UnitUtilityController.js';
import { createUnitUtilityRoutes } from './src/routes/unitUtilityRoutes.js';
import { createFileRoutes } from './src/routes/fileRoutes.js';
import { ExpenseController } from './src/controllers/ExpenseController.js';
import { createExpenseRoutes } from './src/routes/expenseRoutes.js';
import { BulkOperationsController } from './src/controllers/BulkOperationsController.js';
import { createBulkOperationsRoutes } from './src/routes/bulkOperations.js';
import { DependencyContainer } from './src/shared/utils/DependencyContainer.js';
import { FileStorageService } from './src/services/FileStorageService.js';

// Setup global process error handlers
setupProcessErrorHandlers();

logger.info('🚀 Starting Asset Management Platform Backend...', {
  nodeEnv: process.env.NODE_ENV,
  emailProvider: process.env.EMAIL_PROVIDER,
  hasResendApiKey: !!process.env.RESEND_API_KEY,
  dbConfig: process.env.MAIN_DATABASE_URL ? 'url' : 'env_vars',
});

const startServer = async () => {
  const mainDbConfig = process.env.MAIN_DATABASE_URL
    ? { connectionString: process.env.MAIN_DATABASE_URL }
    : {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      };

  const mainPool = new Pool(mainDbConfig);

  const filesDbConfig = process.env.FILES_DATABASE_URL
    ? { connectionString: process.env.FILES_DATABASE_URL }
    : {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_FILES_NAME || process.env.DB_NAME, // Fallback to main DB if not specified
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      };

  const filesPool = new Pool(filesDbConfig);

  // Initialize file storage service
  const fileStorageService = new FileStorageService(mainPool, filesPool);

  // Initialize dependency injection container
  const container = DependencyContainer.initialize(mainPool);

  // Get services from container
  const userService = container.userService;
  const tenantService = container.tenantService;
  const unitService = container.unitService;
  const unitTenantService = container.unitTenantService;
  const leaseService = container.leaseService;
  const rentPaymentService = container.rentPaymentService;
  const rentTransactionService = container.rentTransactionService;
  const passwordResetService = container.passwordResetService;
  const meterService = container.meterService;
  const meterReadingService = container.meterReadingService;
  const receiptService = container.receiptService;
  const receiptTemplateService = container.receiptTemplateService;
  const unitUtilityService = container.unitUtilityService;
  const expenseService = container.expenseService;
  const bulkOperationsService = container.bulkOperationsService;

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
    container.propertyFileService
  );
  
  const propertyReceiptTemplateController = new PropertyReceiptTemplateController(
    getPropertyByIdUseCase,
    container.propertyReceiptTemplateService
  );

  const userController = new UserController(userService, passwordResetService);
  const tenantController = new TenantController(tenantService);
  const unitController = new UnitController(unitService);
  const unitTenantController = new UnitTenantController(unitTenantService);
  const leaseController = new LeaseController(leaseService);
  const rentPaymentController = new RentPaymentController(rentPaymentService);
  const rentTransactionController = new RentTransactionController(rentTransactionService);
  const meterController = new MeterController(meterService, meterReadingService);
  const receiptController = new ReceiptController(receiptService);
  const receiptTemplateController = new ReceiptTemplateController(receiptTemplateService);
  const unitUtilityController = new UnitUtilityController(unitUtilityService);
  const expenseController = new ExpenseController(expenseService);
  const bulkOperationsController = new BulkOperationsController(bulkOperationsService);

  const app = express();

  // Security and CORS middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for Swagger UI to work
  }));
  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:5000', 'http://localhost:5001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Pragma']
  }));
  app.use(express.json());

  // Serve static PDF files
  app.use('/invoices', express.static('public/invoices'));
  app.use('/api/receipts', express.static('public/receipts'));

  // Logging middleware (must be before routes)
  app.use(requestIdMiddleware);
  app.use(requestLoggingMiddleware);

  app.use('/api-docs', swaggerUi.serve as any, swaggerUi.setup(specs, swaggerUiOptions) as any);

  // Initialize database tables
  // await initializeDatabase(mainPool, filesPool);

  /**
   * @swagger
   * /:
   *   get:
   *     summary: Get welcome message
   *     responses:
   *       200:
   *         description: Welcome message
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   */
  app.get('/', (req, res) => {
    res.json({ message: 'Property Management API' });
  });

  /**
   * @swagger
   * /api/health:
   *   get:
   *     summary: Health check endpoint
   *     responses:
   *       200:
   *         description: Service is healthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 timestamp:
   *                   type: string
   *                 uptime:
   *                   type: number
 */
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

  // Mount routes
  app.use('/api/properties', PropertyModule.create(mainPool, userService, { fileController: propertyFileController, receiptTemplateController: propertyReceiptTemplateController }));
  app.use('/api/auth', createAuthRoutes(userService, passwordResetService));
  app.use('/api/users', createUserRoutes(userController, userService));
  app.use('/api', createTenantRoutes(tenantController, userService));
  
  // New Unit Module (Handles /api/units CRUD)
  app.use('/api/units', UnitModule.create(mainPool, userService));
  
  // Legacy Unit Routes (Handles /api/units/:id/tenants, etc.)
  app.use('/api', createUnitRoutes(unitController, userService));
  
  app.use('/api', createUnitTenantRoutes(unitTenantController, userService));
  app.use('/api/leases', createNewLeaseRoutes(authMiddleware(userService) as any));
  app.use('/api/rent-payments', createRentPaymentRoutes(rentPaymentController, userService));
  app.use('/api/rent-transactions', createRentTransactionRoutes(rentTransactionController, userService));
  app.use('/api/meters', createMeterRoutes(meterController, userService));
  app.use('/api/receipts', createReceiptRoutes(receiptController, userService));
  app.use('/api/receipt-templates', createReceiptTemplateRoutes(receiptTemplateController, userService));
  app.use('/api', createTemplateRoutes(mainPool, userService));
  app.use('/api', createUnitUtilityRoutes(unitUtilityController, userService));
  app.use('/api/expenses', createExpenseRoutes(expenseController, userService));
  app.use('/api/files', createFileRoutes(mainPool, filesPool));
  app.use('/api/bulk', createBulkOperationsRoutes(bulkOperationsController, userService));

  // Error handling middleware (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = process.env.PORT || 5002;
  app.listen(PORT, () => {
    logger.info(`✅ Server is running on port ${PORT}`, {
      port: PORT,
      environment: process.env.NODE_ENV,
      swaggerUrl: `http://localhost:${PORT}/api-docs`,
    });
  });
};

// Start the server
startServer().catch((error) => {
  logger.error('❌ Failed to start server:', error);
  process.exit(1);
});