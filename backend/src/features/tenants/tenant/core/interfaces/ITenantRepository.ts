import { Tenant, CreateTenantDTO, UpdateTenantDTO } from '../types/tenant.types';

export interface ITenantRepository {
  findAll(): Promise<Tenant[]>;
  findById(id: string): Promise<Tenant | null>;
  findByEmail(email: string): Promise<Tenant | null>;
  create(data: CreateTenantDTO): Promise<Tenant>;
  update(id: string, data: UpdateTenantDTO): Promise<Tenant | null>;
  delete(id: string): Promise<boolean>;
}
