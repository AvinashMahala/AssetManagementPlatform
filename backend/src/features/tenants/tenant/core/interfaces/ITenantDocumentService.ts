import { TenantDocument } from '../../models/tenant.types';

export interface ITenantDocumentService {
  addDocument(tenantId: string, document: Omit<TenantDocument, 'id' | 'tenantId' | 'uploadedAt'>): Promise<TenantDocument>;
  getDocuments(tenantId: string): Promise<TenantDocument[]>;
  updateDocument(documentId: string, data: Partial<TenantDocument>): Promise<TenantDocument | null>;
  deleteDocument(documentId: string): Promise<boolean>;
  verifyDocument(documentId: string, verifiedBy: string): Promise<boolean>;
}

export default ITenantDocumentService;
