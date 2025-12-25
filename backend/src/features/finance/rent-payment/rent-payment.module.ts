
import { Router } from 'express';
import { Pool } from 'pg';
import { RentPaymentRepository } from './data/RentPaymentRepository';
import { RentPaymentService } from './core/RentPaymentService';
import { RentPaymentController } from './api/RentPaymentController';
import { EventBus } from '@/shared/infrastructure/event-bus/EventBus';
import { LeaseRepository } from '@/features/leases/data/LeaseRepository';
import { TenantRepository } from '@/features/tenants/tenant/data/repository/TenantRepository';

export class RentPaymentModule {
  public router: Router;
  private controller: RentPaymentController;
  private service: RentPaymentService;
  private repository: RentPaymentRepository;

  constructor(pool: Pool, eventBus: EventBus) {
    this.router = Router();
    
    // Initialize dependencies
    this.repository = new RentPaymentRepository(pool);
    
    // We need to instantiate external repositories here
    // Ideally these should be passed in or obtained from a container, but for now we instantiate them
    const leaseRepository = new LeaseRepository(pool);
    const tenantRepository = new TenantRepository(pool);

    this.service = new RentPaymentService(
      this.repository,
      leaseRepository,
      tenantRepository,
      eventBus
    );
    
    this.controller = new RentPaymentController(this.service);
    
    this.setupRoutes();
  }

  private setupRoutes() {
    // Base route: /api/rent-payments

    this.router.get('/', this.controller.getAllPayments.bind(this.controller));
    this.router.get('/:id', this.controller.getPaymentById.bind(this.controller));
    this.router.post('/', this.controller.createPayment.bind(this.controller));
    this.router.put('/:id', this.controller.updatePayment.bind(this.controller));
    this.router.delete('/:id', this.controller.deletePayment.bind(this.controller));

    // Custom routes
    this.router.get('/lease/:leaseId', this.controller.getPaymentsByLease.bind(this.controller));
    this.router.get('/property/:propertyId', this.controller.getPaymentsByProperty.bind(this.controller));
    this.router.get('/tenant/:tenantId', this.controller.getPaymentsByTenant.bind(this.controller));
  }
}
