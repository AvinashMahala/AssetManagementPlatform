import { ITenantService } from '../interfaces/ITenantService';
import { ITenantRepository } from '../../repository/interfaces/ITenantRepository';
import { Tenant, TenantInput } from '../../models/tenant.types';

export class TenantService implements ITenantService {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async getAllTenants(): Promise<Tenant[]> {
    return this.tenantRepository.findAll();
  }

  async getTenantById(id: string): Promise<Tenant | null> {
    return this.tenantRepository.findById(id);
  }

  async getTenantByEmail(email: string): Promise<Tenant | null> {
    return this.tenantRepository.findByEmail(email);
  }

  async getTenantByPhone(phone: string): Promise<Tenant | null> {
    return this.tenantRepository.findByPhone(phone);
  }

  async createTenant(tenantData: TenantInput): Promise<Tenant> {
    return this.tenantRepository.create(tenantData as any);
  }

  async updateTenant(id: string, tenantData: Partial<TenantInput>): Promise<Tenant | null> {
    return this.tenantRepository.update(id, tenantData as any);
  }

  async deleteTenant(id: string): Promise<boolean> {
    return this.tenantRepository.delete(id);
  }

  async updateTenantStatus(id: string, status: string): Promise<boolean> {
    return this.tenantRepository.updateStatus(id, status);
  }
}

export default TenantService;
