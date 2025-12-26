import { Router } from 'express';
import { Pool } from 'pg';
import { TenantRepository } from './repository/TenantRepository';
import { TenantDocumentService } from './core/services/TenantDocumentService';
import { TenantService } from './core/services/TenantService';
import { TenantDocumentController } from './api/TenantDocumentController';
import { createTenantDocumentRoutes } from './api/tenant.documents.routes';
import { FileStorageService } from '@/features/files/file-storage/core/services/FileStorageService';
// document use-cases removed; controllers use TenantDocumentService directly
import { TenantController } from './api/TenantController';
import { createTenantRoutes } from './api/tenant.routes';
import { IUserService } from '@/features/auth/user/core/IUserService';

export class TenantModule {
  static create(pool: Pool, userService: IUserService, options?: { fileStorageService?: FileStorageService }): Router {
    const repository = new TenantRepository(pool);
    const documentService = new TenantDocumentService(repository);
    
    const tenantService = new TenantService(repository);

    // Tenant use-cases removed: controllers call `tenantService` directly now.

    // Document service (controllers call service directly)
    const tenantDocumentService = documentService;

    const controller = new TenantController(tenantService);

    // Create tenant routes and attach document routes under /:tenantId/documents
    const tenantRouter = createTenantRoutes(controller, userService);

    // Wire document controller & routes if file storage service is provided via options
    if (options?.fileStorageService) {
      const fileStorageService = options.fileStorageService;
      const tenantDocumentController = new TenantDocumentController(
        tenantDocumentService,
        fileStorageService
      );

      tenantRouter.use('/documents', createTenantDocumentRoutes(tenantDocumentController, userService));
    }

    return tenantRouter;
  }
}
