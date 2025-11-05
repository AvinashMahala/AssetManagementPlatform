# Receipt Template Customization & Preview Feature - Implementation Plan

## Overview
Allow landlords/property managers to customize receipt templates with a visual editor, preview changes in real-time, and see exactly how the PDF will look before generating it.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Components                       │
├─────────────────────────────────────────────────────────────┤
│  1. Template Editor (Visual Builder)                        │
│  2. Live Preview Panel (PDF Simulation)                     │
│  3. Property Settings Integration                           │
│  4. Template Gallery/Selector                               │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                          │
├─────────────────────────────────────────────────────────────┤
│  1. Template CRUD APIs                                      │
│  2. Preview Generation Service                              │
│  3. PDF Preview Endpoint                                    │
│  4. Template Validation Service                             │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Database Schema                           │
├─────────────────────────────────────────────────────────────┤
│  - receipt_templates (enhanced)                             │
│  - property_template_customizations                         │
│  - template_preview_cache                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Detailed Implementation Plan

### Phase 1: Database & Backend Foundation (Week 1)

#### TODO 1.1: Enhance Database Schema
**Priority: High | Effort: 2-3 hours**

**Tasks:**
- [ ] Add new columns to `receipt_templates` table:
  ```sql
  - template_html TEXT -- HTML/React component structure
  - template_css JSONB -- CSS styling rules
  - layout_config JSONB -- Layout configuration (margins, spacing, etc.)
  - placeholders JSONB -- Available placeholder variables
  - preview_image_url VARCHAR(500) -- Cached preview thumbnail
  ```

- [ ] Create new table `property_template_customizations`:
  ```sql
  CREATE TABLE property_template_customizations (
    id UUID PRIMARY KEY,
    property_id UUID REFERENCES properties(id),
    template_id UUID REFERENCES receipt_templates(id),
    custom_styles JSONB, -- Color overrides, fonts, etc.
    custom_logo_url VARCHAR(500),
    custom_header TEXT,
    custom_footer TEXT,
    show_qr_code BOOLEAN DEFAULT false,
    qr_code_data JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
  );
  ```

- [ ] Create table for preview caching:
  ```sql
  CREATE TABLE template_preview_cache (
    id UUID PRIMARY KEY,
    template_id UUID,
    property_id UUID,
    sample_data JSONB,
    preview_pdf_url VARCHAR(500),
    preview_expires_at TIMESTAMP,
    created_at TIMESTAMP
  );
  ```

**Files to modify:**
- `backend/src/config/database/init/tables.ts`
- `scripts/clean_and_reseed.py`

---

#### TODO 1.2: Create Template Configuration Models
**Priority: High | Effort: 2 hours**

**Tasks:**
- [ ] Create TypeScript interfaces for template customization:
  ```typescript
  // backend/src/models/TemplateCustomization.ts
  
  interface TemplateLayout {
    margins: { top: number; right: number; bottom: number; left: number };
    spacing: { section: number; field: number };
    pageSize: 'A4' | 'Letter';
    orientation: 'portrait' | 'landscape';
  }
  
  interface TemplateStyling {
    theme: {
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      backgroundColor: string;
    };
    fonts: {
      heading: { family: string; size: number; weight: string };
      body: { family: string; size: number; weight: string };
      caption: { family: string; size: number; weight: string };
    };
    borders: {
      width: number;
      color: string;
      radius: number;
    };
  }
  
  interface TemplatePlaceholder {
    key: string; // e.g., '{{tenant.name}}'
    label: string; // e.g., 'Tenant Name'
    type: 'text' | 'number' | 'date' | 'currency';
    category: 'property' | 'tenant' | 'payment' | 'landlord';
    required: boolean;
    defaultValue?: string;
  }
  
  interface TemplateSection {
    id: string;
    name: string;
    visible: boolean;
    order: number;
    fields: string[]; // Array of placeholder keys
  }
  ```

**Files to create:**
- `backend/src/models/TemplateCustomization.ts`
- `backend/src/models/TemplatePreview.ts`

---

#### TODO 1.3: Backend API Endpoints
**Priority: High | Effort: 4-5 hours**

**Tasks:**
- [ ] Template Management APIs:
  ```
  GET    /api/templates                    - List all templates
  GET    /api/templates/:id                - Get template details
  POST   /api/templates                    - Create custom template
  PUT    /api/templates/:id                - Update template
  DELETE /api/templates/:id                - Delete template
  POST   /api/templates/:id/duplicate      - Duplicate template
  ```

- [ ] Property Template Customization APIs:
  ```
  GET    /api/properties/:id/template              - Get property template
  PUT    /api/properties/:id/template              - Update property template
  GET    /api/properties/:id/template/settings     - Get customization settings
  PUT    /api/properties/:id/template/settings     - Update settings
  POST   /api/properties/:id/template/reset        - Reset to default
  ```

- [ ] Preview & Testing APIs:
  ```
  POST   /api/templates/:id/preview                - Generate preview with sample data
  POST   /api/properties/:id/template/preview      - Preview with property data
  GET    /api/templates/placeholders               - Get all available placeholders
  POST   /api/templates/:id/validate               - Validate template configuration
  ```

**Files to create/modify:**
- `backend/src/routes/templateRoutes.ts` (NEW)
- `backend/src/controllers/TemplateController.ts` (NEW)
- `backend/src/services/TemplateCustomizationService.ts` (NEW)
- `backend/src/routes/index.ts` (MODIFY)

---

#### TODO 1.4: Template Preview Service
**Priority: High | Effort: 3-4 hours**

**Tasks:**
- [ ] Create preview generation service:
  ```typescript
  class TemplatePreviewService {
    // Generate preview PDF with sample data
    async generatePreviewPDF(templateId, sampleData, customizations)
    
    // Generate HTML preview (for web display)
    async generatePreviewHTML(templateId, sampleData, customizations)
    
    // Create sample/mock data for preview
    generateSampleData(templateId)
    
    // Cache preview for quick loading
    cachePreview(templateId, propertyId, previewData)
  }
  ```

- [ ] Implement sample data generator:
  - Mock tenant data
  - Mock property data
  - Mock payment data
  - Realistic but clearly marked as "PREVIEW"

**Files to create:**
- `backend/src/services/TemplatePreviewService.ts`
- `backend/src/utils/sampleDataGenerator.ts`

---

### Phase 2: Frontend Template Editor (Week 2)

#### TODO 2.1: Template Editor UI Components
**Priority: High | Effort: 8-10 hours**

**Tasks:**
- [ ] Create main Template Editor page:
  ```
  frontend/src/pages/TemplateEditor.tsx
  ```
  - Split-screen layout (50/50)
  - Left: Editor controls
  - Right: Live preview
  - Responsive design

- [ ] Build Editor Control Panel:
  ```tsx
  // frontend/src/components/template-editor/EditorPanel.tsx
  
  Components needed:
  - TemplateSelector (dropdown to choose base template)
  - LayoutEditor (margins, spacing, page size)
  - ThemeEditor (colors, fonts)
  - SectionManager (show/hide sections, reorder)
  - PlaceholderBrowser (drag-and-drop placeholders)
  - LogoUploader
  - HeaderFooterEditor
  ```

- [ ] Implement drag-and-drop functionality:
  - Use `react-dnd` or `@dnd-kit/core`
  - Drag placeholders from sidebar
  - Drop into template sections
  - Reorder sections

**Files to create:**
- `frontend/src/pages/TemplateEditor.tsx`
- `frontend/src/components/template-editor/EditorPanel.tsx`
- `frontend/src/components/template-editor/TemplateSelector.tsx`
- `frontend/src/components/template-editor/LayoutEditor.tsx`
- `frontend/src/components/template-editor/ThemeEditor.tsx`
- `frontend/src/components/template-editor/SectionManager.tsx`
- `frontend/src/components/template-editor/PlaceholderBrowser.tsx`

---

#### TODO 2.2: Live Preview Component
**Priority: High | Effort: 6-8 hours**

**Tasks:**
- [ ] Create Preview Panel component:
  ```tsx
  // frontend/src/components/template-editor/PreviewPanel.tsx
  
  Features:
  - Real-time rendering as user makes changes
  - Show placeholder values with sample data
  - Zoom controls (50%, 75%, 100%, 150%)
  - Page navigation (if multi-page)
  - Preview mode toggle (with sample data / with real data)
  ```

- [ ] Build PDF Preview component:
  ```tsx
  // frontend/src/components/template-editor/PDFPreview.tsx
  
  Use one of:
  - react-pdf (render actual PDF in browser)
  - HTML/CSS preview that matches PDF output
  - iframe with HTML preview
  ```

- [ ] Implement preview refresh logic:
  - Debounced updates (300ms delay)
  - Loading states
  - Error handling
  - Cache preview responses

**Files to create:**
- `frontend/src/components/template-editor/PreviewPanel.tsx`
- `frontend/src/components/template-editor/PDFPreview.tsx`
- `frontend/src/components/template-editor/PreviewControls.tsx`

---

#### TODO 2.3: Theme & Style Customization UI
**Priority: Medium | Effort: 4-5 hours**

**Tasks:**
- [ ] Color Picker Component:
  ```tsx
  // frontend/src/components/template-editor/ColorPicker.tsx
  - Primary color
  - Secondary color
  - Accent color
  - Background color
  - Border color
  - Use react-colorful or similar
  ```

- [ ] Font Selector:
  ```tsx
  // frontend/src/components/template-editor/FontSelector.tsx
  - Google Fonts integration
  - Preview fonts in dropdown
  - Font size slider
  - Font weight selector
  ```

- [ ] Layout Controls:
  ```tsx
  // frontend/src/components/template-editor/LayoutControls.tsx
  - Margin sliders (top, right, bottom, left)
  - Spacing controls
  - Section padding
  - Page size selector
  ```

**Files to create:**
- `frontend/src/components/template-editor/ColorPicker.tsx`
- `frontend/src/components/template-editor/FontSelector.tsx`
- `frontend/src/components/template-editor/LayoutControls.tsx`

---

#### TODO 2.4: Section & Field Management
**Priority: Medium | Effort: 5-6 hours**

**Tasks:**
- [ ] Section List Component:
  ```tsx
  // frontend/src/components/template-editor/SectionList.tsx
  
  Features:
  - Show/hide toggle for each section
  - Drag to reorder
  - Expand/collapse section details
  - Add custom sections
  ```

- [ ] Field Configurator:
  ```tsx
  // frontend/src/components/template-editor/FieldConfigurator.tsx
  
  For each field:
  - Label customization
  - Show/hide toggle
  - Format options (for dates, currency)
  - Alignment (left, center, right)
  - Font size override
  ```

- [ ] Placeholder Manager:
  ```tsx
  // frontend/src/components/template-editor/PlaceholderManager.tsx
  
  Features:
  - Browse available placeholders by category
  - Search/filter placeholders
  - Preview placeholder values
  - Documentation for each placeholder
  ```

**Files to create:**
- `frontend/src/components/template-editor/SectionList.tsx`
- `frontend/src/components/template-editor/FieldConfigurator.tsx`
- `frontend/src/components/template-editor/PlaceholderManager.tsx`

---

### Phase 3: Integration & Polish (Week 3)

#### TODO 3.1: Property Settings Integration
**Priority: High | Effort: 3-4 hours**

**Tasks:**
- [ ] Add template customization tab to Property Settings:
  ```tsx
  // frontend/src/pages/PropertySettings.tsx
  
  New tab: "Receipt Template"
  - Link to template editor
  - Quick customization options
  - Preview current template
  - Template selection dropdown
  ```

- [ ] Create property-specific template page:
  ```tsx
  // frontend/src/pages/PropertyTemplateCustomization.tsx
  
  Features:
  - Load property's current template
  - Customize for this property only
  - Save property-specific settings
  - Reset to template defaults
  ```

**Files to modify:**
- `frontend/src/pages/PropertySettings.tsx`

**Files to create:**
- `frontend/src/pages/PropertyTemplateCustomization.tsx`

---

#### TODO 3.2: Template Gallery
**Priority: Medium | Effort: 4-5 hours**

**Tasks:**
- [ ] Create Template Gallery page:
  ```tsx
  // frontend/src/pages/TemplateGallery.tsx
  
  Features:
  - Grid of template previews
  - Filter by type (Basic, Professional, Premium)
  - Search templates
  - Preview template in modal
  - Select template for property
  ```

- [ ] Template Card Component:
  ```tsx
  // frontend/src/components/templates/TemplateCard.tsx
  
  Shows:
  - Template thumbnail
  - Template name
  - Template type/category
  - Actions (Preview, Select, Customize)
  ```

**Files to create:**
- `frontend/src/pages/TemplateGallery.tsx`
- `frontend/src/components/templates/TemplateCard.tsx`
- `frontend/src/components/templates/TemplatePreviewModal.tsx`

---

#### TODO 3.3: Receipt Generation Flow Update
**Priority: High | Effort: 2-3 hours**

**Tasks:**
- [ ] Add preview step before generating receipt:
  ```tsx
  // Update receipt generation workflow
  
  Flow:
  1. Select payment(s) for receipt
  2. Preview receipt with actual data
  3. Option to customize template
  4. Generate PDF
  5. Download/email receipt
  ```

- [ ] Create Receipt Preview Modal:
  ```tsx
  // frontend/src/components/receipts/ReceiptPreviewModal.tsx
  
  Features:
  - Show preview with real payment data
  - Edit template button
  - Generate PDF button
  - Email receipt option
  ```

**Files to modify:**
- `frontend/src/pages/RentPayments.tsx` (or wherever receipts are generated)

**Files to create:**
- `frontend/src/components/receipts/ReceiptPreviewModal.tsx`
- `frontend/src/components/receipts/ReceiptGenerationWizard.tsx`

---

#### TODO 3.4: API Integration & State Management
**Priority: High | Effort: 4-5 hours**

**Tasks:**
- [ ] Create API client functions:
  ```typescript
  // frontend/src/services/templateService.ts
  
  export const templateService = {
    getTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    generatePreview,
    getPlaceholders,
    validateTemplate,
    // Property-specific
    getPropertyTemplate,
    updatePropertyTemplate,
    resetPropertyTemplate
  };
  ```

- [ ] Set up state management:
  ```typescript
  // Using React Context or Zustand
  
  TemplateEditorContext:
  - currentTemplate
  - customizations
  - previewData
  - isDirty (unsaved changes)
  - Actions (updateColor, updateFont, etc.)
  ```

**Files to create:**
- `frontend/src/services/templateService.ts`
- `frontend/src/contexts/TemplateEditorContext.tsx`
- `frontend/src/hooks/useTemplateEditor.ts`
- `frontend/src/hooks/useTemplatePreview.ts`

---

### Phase 4: Advanced Features (Week 4)

#### TODO 4.1: Custom Branding
**Priority: Medium | Effort: 3-4 hours**

**Tasks:**
- [ ] Logo upload and management:
  - Upload logo image
  - Crop/resize tool
  - Position logo (top-left, top-center, top-right)
  - Logo size controls

- [ ] Custom header/footer:
  - Rich text editor for header
  - Rich text editor for footer
  - Support for multiple lines
  - Variable insertion

**Files to create:**
- `frontend/src/components/template-editor/LogoUploader.tsx`
- `frontend/src/components/template-editor/HeaderFooterEditor.tsx`

---

#### TODO 4.2: QR Code Integration
**Priority: Medium | Effort: 2-3 hours**

**Tasks:**
- [ ] QR code generator:
  - Add QR code to receipt
  - Configure QR code data (payment link, receipt URL, etc.)
  - Position QR code on receipt
  - Size controls

- [ ] Backend QR generation:
  - Use `qrcode` npm package
  - Generate QR code image
  - Embed in PDF

**Dependencies:**
```bash
npm install qrcode @types/qrcode
```

**Files to create:**
- `frontend/src/components/template-editor/QRCodeConfigurator.tsx`
- `backend/src/utils/qrCodeGenerator.ts`

---

#### TODO 4.3: Template Import/Export
**Priority: Low | Effort: 2-3 hours**

**Tasks:**
- [ ] Export template as JSON:
  - Include all settings
  - Create downloadable file
  - Version metadata

- [ ] Import template from JSON:
  - File upload
  - Validation
  - Preview before importing
  - Conflict resolution

**Files to create:**
- `frontend/src/components/templates/TemplateImportExport.tsx`
- `backend/src/services/TemplateImportExportService.ts`

---

#### TODO 4.4: Template Versioning
**Priority: Low | Effort: 3-4 hours**

**Tasks:**
- [ ] Version history:
  - Track template changes
  - Save versions with timestamps
  - Compare versions
  - Restore previous version

- [ ] Database schema:
  ```sql
  CREATE TABLE template_versions (
    id UUID PRIMARY KEY,
    template_id UUID REFERENCES receipt_templates(id),
    version_number INTEGER,
    configuration JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP,
    notes TEXT
  );
  ```

**Files to create:**
- `backend/src/models/TemplateVersion.ts`
- `backend/src/services/TemplateVersionService.ts`
- `frontend/src/components/templates/VersionHistory.tsx`

---

## Technology Stack Recommendations

### Frontend
- **UI Framework**: React with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Drag & Drop**: `@dnd-kit/core` (modern, accessible)
- **Color Picker**: `react-colorful` (lightweight, fast)
- **Rich Text**: `@tiptap/react` or `react-quill`
- **PDF Preview**: `react-pdf` or custom HTML renderer
- **State**: React Context + useReducer or Zustand
- **Forms**: `react-hook-form` + `zod` validation

### Backend
- **PDF Generation**: PDFKit (already installed)
- **QR Codes**: `qrcode` package
- **Image Processing**: `sharp` (for logo resizing)
- **Validation**: Existing validation utilities

---

## Sample Placeholder Structure

```typescript
const AVAILABLE_PLACEHOLDERS = {
  property: {
    '{{property.name}}': { label: 'Property Name', type: 'text' },
    '{{property.address}}': { label: 'Full Address', type: 'text' },
    '{{property.phone}}': { label: 'Property Phone', type: 'text' },
    '{{property.email}}': { label: 'Property Email', type: 'text' },
  },
  landlord: {
    '{{landlord.name}}': { label: 'Landlord Name', type: 'text' },
    '{{landlord.email}}': { label: 'Landlord Email', type: 'text' },
    '{{landlord.phone}}': { label: 'Landlord Phone', type: 'text' },
  },
  tenant: {
    '{{tenant.name}}': { label: 'Tenant Name', type: 'text' },
    '{{tenant.email}}': { label: 'Tenant Email', type: 'text' },
    '{{tenant.phone}}': { label: 'Tenant Phone', type: 'text' },
    '{{tenant.address}}': { label: 'Tenant Address', type: 'text' },
  },
  payment: {
    '{{payment.amount}}': { label: 'Payment Amount', type: 'currency' },
    '{{payment.date}}': { label: 'Payment Date', type: 'date' },
    '{{payment.method}}': { label: 'Payment Method', type: 'text' },
    '{{payment.reference}}': { label: 'Reference Number', type: 'text' },
  },
  receipt: {
    '{{receipt.number}}': { label: 'Receipt Number', type: 'text' },
    '{{receipt.date}}': { label: 'Receipt Date', type: 'date' },
  },
  period: {
    '{{period.from}}': { label: 'Period Start', type: 'date' },
    '{{period.to}}': { label: 'Period End', type: 'date' },
  },
  breakdown: {
    '{{breakdown.baseRent}}': { label: 'Base Rent', type: 'currency' },
    '{{breakdown.totalAmount}}': { label: 'Total Amount', type: 'currency' },
    '{{breakdown.amountPaid}}': { label: 'Amount Paid', type: 'currency' },
    '{{breakdown.balance}}': { label: 'Balance', type: 'currency' },
  }
};
```

---

## Implementation Priority Order

### Sprint 1 (Week 1): Foundation
1. ✅ Database schema updates
2. ✅ Backend models and interfaces
3. ✅ Basic CRUD APIs for templates
4. ✅ Preview generation service

### Sprint 2 (Week 2): Core Editor
1. ✅ Template editor page structure
2. ✅ Live preview panel
3. ✅ Theme customization UI
4. ✅ Basic section management

### Sprint 3 (Week 3): Integration
1. ✅ Property settings integration
2. ✅ Template gallery
3. ✅ Receipt generation flow update
4. ✅ API integration

### Sprint 4 (Week 4): Polish & Advanced
1. ✅ Custom branding (logo, header/footer)
2. ✅ QR code integration
3. ✅ Import/export
4. ✅ Template versioning

---

## Testing Strategy

### Unit Tests
- [ ] Template validation logic
- [ ] Placeholder replacement
- [ ] Sample data generation
- [ ] PDF generation with custom templates

### Integration Tests
- [ ] Template CRUD operations
- [ ] Preview generation API
- [ ] Property template customization
- [ ] Receipt generation with custom template

### E2E Tests
- [ ] Complete template customization workflow
- [ ] Preview → Generate → Download flow
- [ ] Template selection and application
- [ ] Property-specific customization

### Manual Testing Checklist
- [ ] Editor UI responsiveness
- [ ] Preview accuracy (matches PDF output)
- [ ] All placeholders work correctly
- [ ] Theme changes apply correctly
- [ ] Logo upload and display
- [ ] QR code generation
- [ ] Export/import templates
- [ ] Multi-property template management

---

## Performance Considerations

1. **Preview Caching**:
   - Cache generated previews for 5 minutes
   - Invalidate on template changes
   - Use CDN for preview images

2. **Debouncing**:
   - Debounce preview updates (300ms)
   - Debounce auto-save (2 seconds)

3. **Lazy Loading**:
   - Load template gallery on demand
   - Lazy load preview images
   - Code split editor components

4. **PDF Generation**:
   - Generate PDFs asynchronously
   - Queue system for bulk generation
   - Progress indicators

---

## Security Considerations

1. **Access Control**:
   - Only property owners/managers can edit templates
   - Validate user permissions on all endpoints
   - Audit log for template changes

2. **Input Validation**:
   - Sanitize HTML/CSS input
   - Validate file uploads (logo, import)
   - Limit file sizes

3. **Rate Limiting**:
   - Limit preview generation requests
   - Throttle template saves
   - Queue bulk operations

---

## Future Enhancements (Post-MVP)

1. **AI-Powered Templates**:
   - Suggest template designs based on property type
   - Auto-generate color schemes
   - Smart layout recommendations

2. **Multi-Language Support**:
   - Template translations
   - Right-to-left language support
   - Currency format localization

3. **Advanced Features**:
   - Conditional sections (show if balance > 0)
   - Formula fields (calculated values)
   - Chart/graph integration
   - Multi-page templates

4. **Collaboration**:
   - Share templates between properties
   - Template marketplace
   - Community templates

---

## Estimated Timeline

- **Phase 1 (Backend Foundation)**: 5-7 days
- **Phase 2 (Frontend Editor)**: 10-12 days
- **Phase 3 (Integration)**: 5-7 days
- **Phase 4 (Advanced Features)**: 5-7 days
- **Testing & Bug Fixes**: 3-5 days

**Total Estimated Time**: 4-6 weeks for full implementation

---

## Success Metrics

1. **User Adoption**:
   - % of properties using custom templates
   - Number of templates created per user

2. **Preview Usage**:
   - Preview views before PDF generation
   - Preview-to-generation ratio

3. **Template Performance**:
   - Average preview generation time < 2s
   - Average PDF generation time < 3s

4. **User Satisfaction**:
   - Template customization completion rate
   - User feedback/ratings
   - Support tickets related to templates

---

## Next Steps

1. **Review and Approve Plan**: Review this document with stakeholders
2. **Setup Project Board**: Create tickets for each TODO item
3. **Begin Phase 1**: Start with database schema updates
4. **Daily Standups**: Track progress and blockers
5. **Weekly Demos**: Show progress to stakeholders

---

## Questions to Answer

1. Should we support multiple templates per property or one at a time?
2. What file formats for logo upload? (PNG, JPG, SVG?)
3. Maximum logo file size?
4. Should users be able to share templates across properties?
5. Do we need approval workflow for template changes?
6. Should there be a template preview on the properties list?
7. Export format preferences (JSON, YAML, both)?

---

**Document Version**: 1.0  
**Last Updated**: November 4, 2025  
**Author**: AI Development Assistant  
**Status**: Ready for Review
