import { Tenant, TenantInput, TenantDocument } from '../../models/Tenant';

export interface ITenantRepository {
  findAll(): Promise<Tenant[]>;
  findById(id: number): Promise<Tenant | null>;
  findByEmail(email: string): Promise<Tenant | null>;
  findByPhone(phone: string): Promise<Tenant | null>;
  create(data: Omit<Tenant, 'id' | 'documents' | 'createdAt' | 'updatedAt'>): Promise<Tenant>;
  update(id: number, data: Partial<Omit<Tenant, 'id' | 'documents' | 'createdAt' | 'updatedAt'>>): Promise<Tenant | null>;
  delete(id: number): Promise<boolean>;
  updateStatus(id: number, status: string): Promise<boolean>;

  // Document management
  addDocument(tenantId: number, document: Omit<TenantDocument, 'id' | 'tenantId' | 'uploadedAt'>): Promise<TenantDocument>;
  getDocuments(tenantId: number): Promise<TenantDocument[]>;
  updateDocument(documentId: number, data: Partial<TenantDocument>): Promise<TenantDocument | null>;
  deleteDocument(documentId: number): Promise<boolean>;
}