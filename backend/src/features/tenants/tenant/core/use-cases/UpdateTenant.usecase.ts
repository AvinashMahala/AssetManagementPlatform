import { IUseCase } from '@/shared/core/IUseCase';
import { ITenantRepository } from '../interfaces/ITenantRepository';
import { UpdateTenantDTO, Tenant } from '../types/tenant.types';
import { TenantNotFoundError } from '../errors/TenantNotFoundError';

export interface UpdateTenantRequest {
  id: string;
  data: UpdateTenantDTO;
}

export class UpdateTenantUseCase implements IUseCase<UpdateTenantRequest, Tenant> {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async execute(request: UpdateTenantRequest): Promise<Tenant> {
    const tenant = await this.tenantRepository.update(request.id, request.data);
    if (!tenant) {
      throw new TenantNotFoundError(request.id);
    }
    return tenant;
  }
}
