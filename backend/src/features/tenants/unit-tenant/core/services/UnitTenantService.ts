import { IUnitTenantService } from '../interfaces/IUnitTenantService';
import { IUnitTenantRepository } from '../../repository/interfaces/IUnitTenantRepository';
import { UnitTenant, UnitTenantInput } from '../../models/unit-tenant.types';
import { AppError } from '@/shared/middleware/errorHandler.js';
import { createModuleLogger } from '@/shared/utils/logger.js';
import { RepositoryError } from '@/shared/errors/RepositoryError.js';

const logger = createModuleLogger('UnitTenantService');

/**
 * Service layer for unit-tenant operations
 *
 * Delegates to repository for persistence and exposes a thin domain API used
 * by controllers and higher-level modules.
 */
export class UnitTenantService implements IUnitTenantService {
  constructor(private readonly repository: IUnitTenantRepository) {}

  /** Get tenants assigned to a unit */
  async findUnitTenants(unitId: string): Promise<UnitTenant[]> {
    try {
      return await this.repository.findUnitTenants(unitId);
    } catch (error) {
      if (error instanceof AppError || error instanceof RepositoryError) throw error;
      logger.error(`Failed to find unit tenants for unit ${unitId}`, error as Error, { unitId });
      throw new AppError(`Failed to find unit tenants for unit ${unitId}`, 500, false, 'SERVICE_ERROR');
    }
  }

  /** Get assignments by tenant */
  async findByTenant(tenantId: string): Promise<UnitTenant[]> {
    try {
      return await this.repository.findByTenant(tenantId);
    } catch (error) {
      if (error instanceof AppError || error instanceof RepositoryError) throw error;
      logger.error(`Failed to find unit tenants for tenant ${tenantId}`, error as Error, { tenantId });
      throw new AppError(`Failed to find unit tenants for tenant ${tenantId}`, 500, false, 'SERVICE_ERROR');
    }
  }

  /** Get all assignments */
  async findAll(): Promise<UnitTenant[]> {
    try {
      return await this.repository.findAll();
    } catch (error) {
      if (error instanceof AppError || error instanceof RepositoryError) throw error;
      logger.error('Failed to find all unit tenants', error as Error);
      throw new AppError('Failed to find all unit tenants', 500, false, 'SERVICE_ERROR');
    }
  }

  /** Get a specific assignment */
  async findById(id: string): Promise<UnitTenant | null> {
    try {
      return await this.repository.findById(id);
    } catch (error) {
      if (error instanceof AppError || error instanceof RepositoryError) throw error;
      logger.error(`Failed to find unit-tenant by id ${id}`, error as Error, { id });
      throw new AppError(`Failed to find unit-tenant by id ${id}`, 500, false, 'SERVICE_ERROR');
    }
  }

  /** Assign a tenant to a unit */
  async assignTenantToUnit(data: UnitTenantInput): Promise<UnitTenant> {
    try {
      return await this.repository.assignTenantToUnit(data);
    } catch (error) {
      if (error instanceof AppError || error instanceof RepositoryError) throw error;
      logger.error(`Failed to assign tenant ${data.tenantId} to unit ${data.unitId}`, error as Error, { unitId: data.unitId, tenantId: data.tenantId });
      throw new AppError(`Failed to assign tenant to unit`, 500, false, 'SERVICE_ERROR');
    }
  }

  /** Update assignment details */
  async updateTenantAssignment(unitId: string, tenantId: string, updates: Partial<UnitTenantInput>): Promise<UnitTenant | null> {
    try {
      return await this.repository.updateTenantAssignment(unitId, tenantId, updates);
    } catch (error) {
      if (error instanceof AppError || error instanceof RepositoryError) throw error;
      logger.error(`Failed to update tenant assignment for tenant ${tenantId} on unit ${unitId}`, error as Error, { unitId, tenantId, updates });
      throw new AppError(`Failed to update tenant assignment`, 500, false, 'SERVICE_ERROR');
    }
  }

  /** Remove tenant from a unit */
  async removeTenantFromUnit(unitId: string, tenantId: string): Promise<boolean> {
    try {
      return await this.repository.removeTenantFromUnit(unitId, tenantId);
    } catch (error) {
      if (error instanceof AppError || error instanceof RepositoryError) throw error;
      logger.error(`Failed to remove tenant ${tenantId} from unit ${unitId}`, error as Error, { unitId, tenantId });
      throw new AppError(`Failed to remove tenant from unit`, 500, false, 'SERVICE_ERROR');
    }
  }
}

export default UnitTenantService;
