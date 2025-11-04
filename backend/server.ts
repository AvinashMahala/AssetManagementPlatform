import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Pool } from 'pg';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
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
import { PropertyController } from './src/controllers/propertyController.js';
import { UserController } from './src/controllers/userController.js';
import { TenantController } from './src/controllers/TenantController.js';
import { UnitController } from './src/controllers/UnitController.js';
import { UnitTenantController } from './src/controllers/UnitTenantController.js';
import { createPropertyRoutes } from './src/routes/propertyRoutes.js';
import { createAuthRoutes } from './src/routes/authRoutes.js';
import { createTenantRoutes } from './src/routes/tenantRoutes.js';
import { createUnitRoutes } from './src/routes/unitRoutes.js';
import { createUnitTenantRoutes } from './src/routes/unitTenantRoutes.js';
import { DependencyContainer } from './src/utils/DependencyContainer.js';

console.log('Environment variables loaded:');
console.log('EMAIL_PROVIDER:', process.env.EMAIL_PROVIDER);
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set' : 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize dependency injection container
const container = DependencyContainer.initialize(pool);

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

// Create controllers with injected services
const propertyController = new PropertyController(propertyService);
const userController = new UserController(userService, passwordResetService);
const tenantController = new TenantController(tenantService);
const unitController = new UnitController(unitService);
const unitTenantController = new UnitTenantController(unitTenantService);
const leaseController = new LeaseController(leaseService);
const rentPaymentController = new RentPaymentController(rentPaymentService);
const rentTransactionController = new RentTransactionController(rentTransactionService);
const meterController = new MeterController(meterService, meterReadingService);

import { specs } from './src/config/swagger/index.js';
import { swaggerUiOptions } from './src/config/swagger/index.js';
import { initializeDatabase } from './src/config/database/init/index.js';

const app = express();

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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

// Initialize database tables
initializeDatabase(pool);

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

// Mount routes
app.use('/api/properties', createPropertyRoutes(propertyController, userService));
app.use('/api/auth', createAuthRoutes(userService, passwordResetService));
app.use('/api', createTenantRoutes(tenantController, userService));
app.use('/api', createUnitRoutes(unitController, userService));
app.use('/api', createUnitTenantRoutes(unitTenantController, userService));
app.use('/api/leases', createLeaseRoutes(leaseController, userService));
app.use('/api/rent-payments', createRentPaymentRoutes(rentPaymentController, userService));
app.use('/api/rent-transactions', createRentTransactionRoutes(rentTransactionController, userService));
app.use('/api/meters', createMeterRoutes(meterController, userService));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});