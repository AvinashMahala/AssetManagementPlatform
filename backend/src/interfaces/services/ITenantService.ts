import { Tenant, TenantInput, TenantDocument } from '../../models/Tenant';

export interface ITenantService {
  getAllTenants(): Promise<Tenant[]>;
  getTenantById(id: number): Promise<Tenant | null>;
  getTenantByEmail(email: string): Promise<Tenant | null>;
  getTenantByPhone(phone: string): Promise<Tenant | null>;
  createTenant(tenantData: TenantInput): Promise<Tenant>;
  updateTenant(id: number, tenantData: Partial<TenantInput>): Promise<Tenant | null>;
  deleteTenant(id: number): Promise<boolean>;
  updateTenantStatus(id: number, status: string): Promise<boolean>;

  // Document management
  addTenantDocument(tenantId: number, document: Omit<TenantDocument, 'id' | 'tenantId' | 'uploadedAt'>): Promise<TenantDocument>;
  getTenantDocuments(tenantId: number): Promise<TenantDocument[]>;
  updateTenantDocument(documentId: number, data: Partial<TenantDocument>): Promise<TenantDocument | null>;
  deleteTenantDocument(documentId: number): Promise<boolean>;
  verifyTenantDocument(documentId: number, verifiedBy: number): Promise<boolean>;
}