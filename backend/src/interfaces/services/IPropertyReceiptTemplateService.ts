import { PropertyReceiptTemplate } from '../../models/Property';

export interface IPropertyReceiptTemplateService {
  createTemplate(propertyId: string, templateData: Omit<PropertyReceiptTemplate, 'id' | 'propertyId' | 'createdAt' | 'updatedAt'>): Promise<PropertyReceiptTemplate>;
  getTemplateByPropertyId(propertyId: string): Promise<PropertyReceiptTemplate | null>;
  updateTemplate(propertyId: string, updates: Partial<Omit<PropertyReceiptTemplate, 'id' | 'propertyId' | 'createdAt' | 'updatedAt'>>): Promise<PropertyReceiptTemplate | null>;
  deleteTemplate(propertyId: string): Promise<boolean>;
  generateUPILinks(wallets: Array<{ type: string; upiId: string; generateUPILinks: boolean }>, amount?: number): string[];
}