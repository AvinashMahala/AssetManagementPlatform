import { Tenant, TenantInput, TenantDocument } from '../../models/Tenant';

export interface ITenantService {
  getAllTenants(): Promise<Tenant[]>;
  getTenantById(id: string): Promise<Tenant | null>;
  getTenantByEmail(email: string): Promise<Tenant | null>;
  getTenantByPhone(phone: string): Promise<Tenant | null>;
  createTenant(tenantData: TenantInput): Promise<Tenant>;
  updateTenant(id: string, tenantData: Partial<TenantInput>): Promise<Tenant | null>;
  deleteTenant(id: string): Promise<boolean>;
  updateTenantStatus(id: string, status: string): Promise<boolean>;

  // Document management
  addTenantDocument(tenantId: string, document: Omit<TenantDocument, 'id' | 'tenantId' | 'uploadedAt'>): Promise<TenantDocument>;
  getTenantDocuments(tenantId: string): Promise<TenantDocument[]>;
  updateTenantDocument(documentId: string, data: Partial<TenantDocument>): Promise<TenantDocument | null>;
  deleteTenantDocument(documentId: string): Promise<boolean>;
  verifyTenantDocument(documentId: string, verifiedBy: string): Promise<boolean>;
}