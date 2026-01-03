import { ITenantService } from '../interfaces/ITenantService';
import { ITenantRepository } from '../../repository/interfaces/ITenantRepository';
import { Tenant, TenantInput } from '../../models/tenant.types';
import { AppError } from '@/shared/middleware/errorHandler.js';
import { createModuleLogger } from '@/shared/utils/logger.js';
import { RepositoryError } from '@/shared/errors/RepositoryError.js';

const logger = createModuleLogger('TenantService');

export class TenantService implements ITenantService {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async getAllTenants(): Promise<Tenant[]> {
    try {
      return await this.tenantRepository.findAll();
    } catch (error) {
      if (error instanceof AppError || error instanceof RepositoryError) throw error;
      logger.error('Failed to fetch all tenants', error as Error);
      throw new AppError('Failed to fetch tenants', 500, false, 'SERVICE_ERROR');
    }
  }

  async getTenantById(id: string): Promise<Tenant | null> {
    try {
      return await this.tenantRepository.findById(id);
    } catch (error) {
      if (error instanceof AppError || error instanceof RepositoryError) throw error;
      logger.error(`Failed to fetch tenant by id ${id}`, error as Error, { id });
      throw new AppError('Failed to fetch tenant', 500, false, 'SERVICE_ERROR');
    }
  }

  async getTenantByEmail(email: string): Promise<Tenant | null> {
    try {
      return await this.tenantRepository.findByEmail(email);
    } catch (error) {
      if (error instanceof AppError || error instanceof RepositoryError) throw error;
      logger.error(`Failed to fetch tenant by email ${email}`, error as Error, { email });
      throw new AppError('Failed to fetch tenant by email', 500, false, 'SERVICE_ERROR');
    }
  }

  async getTenantByPhone(phone: string): Promise<Tenant | null> {
    try {
      return await this.tenantRepository.findByPhone(phone);
    } catch (error) {
      if (error instanceof AppError || error instanceof RepositoryError) throw error;
      logger.error(`Failed to fetch tenant by phone ${phone}`, error as Error, { phone });
      throw new AppError('Failed to fetch tenant by phone', 500, false, 'SERVICE_ERROR');
    }
  }

  async createTenant(tenantData: TenantInput): Promise<Tenant> {
    try {
      return await this.tenantRepository.create(tenantData as any);
    } catch (error) {
      if (error instanceof AppError || error instanceof RepositoryError) throw error;
      logger.error('Failed to create tenant', error as Error, { tenantData });
      throw new AppError('Failed to create tenant', 500, false, 'SERVICE_ERROR');
    }
  }

  async updateTenant(id: string, tenantData: Partial<TenantInput>): Promise<Tenant | null> {
    try {
      return await this.tenantRepository.update(id, tenantData as any);
    } catch (error) {
      if (error instanceof AppError || error instanceof RepositoryError) throw error;
      logger.error(`Failed to update tenant ${id}`, error as Error, { id, tenantData });
      throw new AppError('Failed to update tenant', 500, false, 'SERVICE_ERROR');
    }
  }

  async deleteTenant(id: string): Promise<boolean> {
    try {
      return await this.tenantRepository.delete(id);
    } catch (error) {
      if (error instanceof AppError || error instanceof RepositoryError) throw error;
      logger.error(`Failed to delete tenant ${id}`, error as Error, { id });
      throw new AppError('Failed to delete tenant', 500, false, 'SERVICE_ERROR');
    }
  }

  async updateTenantStatus(id: string, status: string): Promise<boolean> {
    try {
      return await this.tenantRepository.updateStatus(id, status);
    } catch (error) {
      if (error instanceof AppError || error instanceof RepositoryError) throw error;
      logger.error(`Failed to update tenant status for ${id}`, error as Error, { id, status });
      throw new AppError('Failed to update tenant status', 500, false, 'SERVICE_ERROR');
    }
  }
}

export default TenantService;
