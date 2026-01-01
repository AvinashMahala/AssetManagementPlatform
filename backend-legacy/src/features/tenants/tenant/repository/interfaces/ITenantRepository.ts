import { Tenant, CreateTenantDTO, UpdateTenantDTO, TenantDocument } from '../../models/tenant.types';

export interface ITenantRepository {
  findAll(): Promise<Tenant[]>;
  findById(id: string): Promise<Tenant | null>;
  findByEmail(email: string): Promise<Tenant | null>;
  findByPhone(phone: string): Promise<Tenant | null>;
  create(data: CreateTenantDTO): Promise<Tenant>;
  update(id: string, data: UpdateTenantDTO): Promise<Tenant | null>;
  delete(id: string): Promise<boolean>;
  updateStatus(id: string, status: string): Promise<boolean>;

  // Document management
  addDocument(tenantId: string, document: Omit<TenantDocument, 'id' | 'tenantId' | 'uploadedAt'>): Promise<TenantDocument>;
  getDocuments(tenantId: string): Promise<TenantDocument[]>;
  updateDocument(documentId: string, data: Partial<TenantDocument>): Promise<TenantDocument | null>;
  deleteDocument(documentId: string): Promise<boolean>;
}
