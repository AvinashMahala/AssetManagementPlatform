
import { Router } from 'express';
import { Pool } from 'pg';
import { RentTransactionRepository } from './data/RentTransactionRepository';
import { RentTransactionService } from './core/RentTransactionService';
import { RentTransactionController } from './api/RentTransactionController';
import { EventBus } from '@/shared/infrastructure/event-bus/EventBus';
import { LeaseRepository } from '@/features/leases/data/LeaseRepository';
import { TenantRepository } from '@/features/tenants/tenant/data/repository/TenantRepository';

export class RentTransactionModule {
  public router: Router;
  private controller: RentTransactionController;
  private service: RentTransactionService;
  private repository: RentTransactionRepository;

  constructor(pool: Pool, eventBus: EventBus) {
    this.router = Router();
    
    // Initialize dependencies
    this.repository = new RentTransactionRepository(pool);
    
    // We need to instantiate external repositories here
    const leaseRepository = new LeaseRepository(pool);
    const tenantRepository = new TenantRepository(pool);

    this.service = new RentTransactionService(
      this.repository,
      leaseRepository,
      tenantRepository,
      eventBus
    );
    
    this.controller = new RentTransactionController(this.service);
    
    this.setupRoutes();
  }

  private setupRoutes() {
    // Base route: /api/rent-transactions

    this.router.get('/', this.controller.getAllTransactions.bind(this.controller));
    this.router.get('/:id', this.controller.getTransactionById.bind(this.controller));
    this.router.post('/', this.controller.createTransaction.bind(this.controller));
    this.router.put('/:id', this.controller.updateTransaction.bind(this.controller));
    this.router.delete('/:id', this.controller.deleteTransaction.bind(this.controller));

    // Custom routes
    this.router.get('/lease/:leaseId', this.controller.getTransactionsByLease.bind(this.controller));
    this.router.get('/property/:propertyId', this.controller.getTransactionsByProperty.bind(this.controller));
    this.router.get('/tenant/:tenantId', this.controller.getTransactionsByTenant.bind(this.controller));
    this.router.get('/unit/:unitId', this.controller.getTransactionsByUnit.bind(this.controller));
  }
}
