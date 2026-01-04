import { apiClient } from '@/lib/apiClient';
import type { TemplatePreviewRequest } from '../types';

export const templateService = {
  // Template CRUD
  async getAllTemplates() {
    const response = await apiClient.get('/api/v1/receipt-templates');
    return response.data;
  },

  async getTemplateById(id: string) {
    const response = await apiClient.get(`/api/v1/receipt-templates/${id}`);
    return response.data;
  },

  async generatePreview(request: TemplatePreviewRequest) {
    const response = await apiClient.post('/api/v1/receipt-templates/preview', {
      templateId: request.templateId,
      propertyId: request.propertyId,
      sampleData: request.sampleData,
      customizations: request.customizations,
      format: request.format || 'html',
    });
    return response.data;
  },

  async getAvailablePlaceholders() {
    const response = await apiClient.get('/api/v1/receipt-templates/templates/placeholders/available');
    return response.data;
  },

  // Property template customization
  async getPropertyTemplate(propertyId: string) {
    const response = await apiClient.get(`/api/properties/${propertyId}/template`);
    return response.data;
  },

  async updatePropertyTemplate(propertyId: string, data: any) {
    const response = await apiClient.put(`/api/properties/${propertyId}/template`, data);
    return response.data;
  },
};
