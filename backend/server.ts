import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Pool } from 'pg';
import { logger } from './src/utils/logger.js';
import { requestLoggingMiddleware, requestIdMiddleware } from './src/middlewares/loggingMiddleware.js';
import { errorHandler, notFoundHandler, setupProcessErrorHandlers } from './src/middlewares/errorHandler.js';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { specs } from './src/config/swagger/index.js';
import { swaggerUiOptions } from './src/config/swagger/index.js';
import { initializeDatabase } from './src/config/database/init/index.js';
import { IPropertyRepository } from './src/interfaces/repositories/IPropertyRepository.js';
import { IUserRepository } from './src/interfaces/repositories/IUserRepository.js';
import { ITenantRepository } from './src/interfaces/repositories/ITenantRepository.js';
import { IUnitRepository } from './src/interfaces/repositories/IUnitRepository.js';
import { ILeaseRepository } from './src/interfaces/repositories/ILeaseRepository.js';
import { ILeaseService } from './src/interfaces/services/ILeaseService.js';
import { LeaseRepository } from './src/repositories/LeaseRepository.js';
import { LeaseService } from './src/services/LeaseService.js';
import { LeaseController } from './src/controllers/leaseController.js';
import { createLeaseRoutes } from './src/routes/leaseRoutes.js';
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
import { PropertyController } from './src/controllers/propertyController.js';
import { PropertyFileController } from './src/controllers/PropertyFileController.js';
import { PropertyReceiptTemplateController } from './src/controllers/PropertyReceiptTemplateController.js';
import { UserController } from './src/controllers/userController.js';
import { TenantController } from './src/controllers/TenantController.js';
import { UnitController } from './src/controllers/UnitController.js';
import { UnitTenantController } from './src/controllers/UnitTenantController.js';
import { createPropertyRoutes } from './src/routes/propertyRoutes.js';
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
import { DependencyContainer } from './src/utils/DependencyContainer.js';

// Setup global process error handlers
setupProcessErrorHandlers();

logger.info('🚀 Starting Asset Management Platform Backend...', {
  nodeEnv: process.env.NODE_ENV,
  emailProvider: process.env.EMAIL_PROVIDER,
  hasResendApiKey: !!process.env.RESEND_API_KEY,
});

// Setup global process error handlers
setupProcessErrorHandlers();

logger.info('🚀 Starting Asset Management Platform Backend...', {
  nodeEnv: process.env.NODE_ENV,
  emailProvider: process.env.EMAIL_PROVIDER,
  hasResendApiKey: !!process.env.RESEND_API_KEY,
});

const startServer = async () => {
  const mainPool = new Pool({
    connectionString: process.env.MAIN_DATABASE_URL,
  });

  const filesPool = new Pool({
    connectionString: process.env.FILES_DATABASE_URL,
  });

  // Initialize dependency injection container
  const container = DependencyContainer.initialize(mainPool);

  // Get services from container
  const propertyService = container.propertyService;
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

  // Create controllers with injected services
  const propertyController = new PropertyController(propertyService);
  const propertyFileController = new PropertyFileController(propertyService);
  const propertyReceiptTemplateController = new PropertyReceiptTemplateController(propertyService);
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
  app.use('/api/invoices', express.static('public/invoices'));
  app.use('/api/receipts', express.static('public/receipts'));

  // Logging middleware (must be before routes)
  app.use(requestIdMiddleware);
  app.use(requestLoggingMiddleware);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

  // Initialize database tables
  await initializeDatabase(mainPool, filesPool);

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
  app.use('/api/properties', createPropertyRoutes(propertyController, propertyFileController, propertyReceiptTemplateController, userService));
  app.use('/api/auth', createAuthRoutes(userService, passwordResetService));
  app.use('/api/users', createUserRoutes(userController, userService));
  app.use('/api', createTenantRoutes(tenantController, userService));
  app.use('/api', createUnitRoutes(unitController, userService));
  app.use('/api', createUnitTenantRoutes(unitTenantController, userService));
  app.use('/api/leases', createLeaseRoutes(leaseController, userService));
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