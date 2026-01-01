import { ITenantDocumentService } from '../interfaces/ITenantDocumentService';
import { ITenantRepository } from '../../repository/interfaces/ITenantRepository';
import { TenantDocument } from '../../models/tenant.types';

export class TenantDocumentService implements ITenantDocumentService {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async addDocument(tenantId: string, document: Omit<TenantDocument, 'id' | 'tenantId' | 'uploadedAt'>): Promise<TenantDocument> {
    return this.tenantRepository.addDocument(tenantId, document);
  }

  async getDocuments(tenantId: string): Promise<TenantDocument[]> {
    return this.tenantRepository.getDocuments(tenantId);
  }

  async updateDocument(documentId: string, data: Partial<TenantDocument>): Promise<TenantDocument | null> {
    return this.tenantRepository.updateDocument(documentId, data);
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    return this.tenantRepository.deleteDocument(documentId);
  }

  async verifyDocument(documentId: string, verifiedBy: string): Promise<boolean> {
    const verifiedAt = new Date();
    const updated = await this.tenantRepository.updateDocument(documentId, {
      verified: true,
      verifiedAt,
      verifiedBy,
    });
    return updated !== null;
  }
}

export default TenantDocumentService;
