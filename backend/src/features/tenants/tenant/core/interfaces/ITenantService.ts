import { Tenant, TenantInput, TenantDocument } from '../../models/tenant.types';

export interface ITenantService {
  getAllTenants(): Promise<Tenant[]>;
  getTenantById(id: string): Promise<Tenant | null>;
  getTenantByEmail(email: string): Promise<Tenant | null>;
  getTenantByPhone(phone: string): Promise<Tenant | null>;
  createTenant(tenantData: TenantInput): Promise<Tenant>;
  updateTenant(id: string, tenantData: Partial<TenantInput>): Promise<Tenant | null>;
  deleteTenant(id: string): Promise<boolean>;
  updateTenantStatus(id: string, status: string): Promise<boolean>;

  // Note: Document management has been extracted to a dedicated
  // `ITenantDocumentService` to keep a single responsibility for tenant
  // operations. See `core/interfaces/ITenantDocumentService.ts`.
}
