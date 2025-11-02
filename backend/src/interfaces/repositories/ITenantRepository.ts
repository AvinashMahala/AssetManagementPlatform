import { Tenant, TenantInput, TenantDocument } from '../../models/Tenant';

export interface ITenantRepository {
  findAll(): Promise<Tenant[]>;
  findById(id: string): Promise<Tenant | null>;
  findByEmail(email: string): Promise<Tenant | null>;
  findByPhone(phone: string): Promise<Tenant | null>;
  create(data: Omit<Tenant, 'id' | 'documents' | 'createdAt' | 'updatedAt'>): Promise<Tenant>;
  update(id: string, data: Partial<Omit<Tenant, 'id' | 'documents' | 'createdAt' | 'updatedAt'>>): Promise<Tenant | null>;
  delete(id: string): Promise<boolean>;
  updateStatus(id: string, status: string): Promise<boolean>;

  // Document management
  addDocument(tenantId: string, document: Omit<TenantDocument, 'id' | 'tenantId' | 'uploadedAt'>): Promise<TenantDocument>;
  getDocuments(tenantId: string): Promise<TenantDocument[]>;
  updateDocument(documentId: string, data: Partial<TenantDocument>): Promise<TenantDocument | null>;
  deleteDocument(documentId: string): Promise<boolean>;
}