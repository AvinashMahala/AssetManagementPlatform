export interface TemplatePreviewRequest {
  templateId: string;
  propertyId?: string;
  sampleData?: any;
  customizations?: any;
  format?: 'html' | 'pdf' | 'both';
}
