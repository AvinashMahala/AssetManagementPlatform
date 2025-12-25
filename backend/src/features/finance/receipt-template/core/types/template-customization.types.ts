
/**
 * Template Customization Models
 * Interfaces and types for receipt template customization
 */

// ============================================================================
// Layout Configuration
// ============================================================================

export interface TemplateMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface TemplateSpacing {
  section: number;  // Space between sections (e.g., property details, payment breakdown)
  field: number;    // Space between individual fields
}

export interface TemplateLayout {
  margins: TemplateMargins;
  spacing: TemplateSpacing;
  pageSize: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  showHeader: boolean;
  showFooter: boolean;
  headerHeight?: number;
  footerHeight?: number;
}

// ============================================================================
// Styling Configuration
// ============================================================================

export interface ThemeColors {
  primary: string;      // Main brand color (headers, buttons)
  secondary: string;    // Secondary color (subheadings)
  accent: string;       // Accent color (highlights)
  text: string;         // Main text color
  textLight: string;    // Light text color (captions, labels)
  background: string;   // Background color
  border: string;       // Border color
}

export interface FontConfig {
  family: string;
  size: number;
  weight: 'normal' | 'bold' | 'light' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  lineHeight?: number;
}

export interface TemplateFonts {
  heading: FontConfig;   // Section headings
  body: FontConfig;      // Normal text
  caption: FontConfig;   // Small text, labels
  title?: FontConfig;    // Document title
}

export interface BorderStyle {
  width: number;
  color: string;
  radius: number;
  style?: 'solid' | 'dashed' | 'dotted';
}

export interface TemplateStyling {
  theme: ThemeColors;
  fonts: TemplateFonts;
  borders: BorderStyle;
  shadows?: {
    box: string;
    text: string;
  };
}

// ============================================================================
// Placeholder Configuration
// ============================================================================

export type PlaceholderType = 'text' | 'number' | 'date' | 'currency' | 'email' | 'phone' | 'address';
export type PlaceholderCategory = 'property' | 'tenant' | 'payment' | 'landlord' | 'receipt' | 'period' | 'breakdown' | 'unit' | 'lease';

export interface TemplatePlaceholder {
  key: string;                    // e.g., '{{tenant.name}}'
  label: string;                  // e.g., 'Tenant Name'
  description?: string;           // Help text
  type: PlaceholderType;
  category: PlaceholderCategory;
  required: boolean;
  defaultValue?: string;
  format?: string;                // For dates, numbers (e.g., 'DD/MM/YYYY', '#,##0.00')
  example?: string;               // Example value for preview
}

// ============================================================================
// Section Configuration
// ============================================================================

export interface TemplateField {
  placeholderKey: string;         // Reference to placeholder
  label?: string;                 // Custom label override
  visible: boolean;
  order: number;
  alignment?: 'left' | 'center' | 'right';
  width?: string;                 // CSS width value
  customFormat?: string;          // Override default format
  bold?: boolean;
  italic?: boolean;
}

export interface TemplateSection {
  id: string;                     // Unique section identifier
  name: string;                   // Display name
  description?: string;
  visible: boolean;
  order: number;
  fields: TemplateField[];
  showBorder?: boolean;
  backgroundColor?: string;
  padding?: number;
  collapsible?: boolean;
}

// ============================================================================
// Branding Configuration
// ============================================================================

export interface LogoConfig {
  url?: string;
  position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  width: number;
  height: number;
  alignment?: 'left' | 'center' | 'right';
}

export interface QRCodeConfig {
  enabled: boolean;
  data: string;                   // What to encode (URL, payment info, etc.)
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size: number;
  caption?: string;
}

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  opacity: number;
  angle: number;
  color: string;
  fontSize: number;
}

// ============================================================================
// Complete Template Configuration
// ============================================================================

export interface TemplateConfiguration {
  id?: string;
  name: string;
  type: 'basic' | 'professional' | 'premium';
  description?: string;
  
  // Core configuration
  layout: TemplateLayout;
  styling: TemplateStyling;
  sections: TemplateSection[];
  
  // Branding
  logo?: LogoConfig;
  qrCode?: QRCodeConfig;
  watermark?: WatermarkConfig;
  customHeader?: string;          // Rich text/HTML
  customFooter?: string;          // Rich text/HTML
  
  // Metadata
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Property-Specific Customization
// ============================================================================

export interface PropertyTemplateCustomization {
  id?: string;
  propertyId: string;
  templateId: string;
  
  // Override styling
  customStyles?: Partial<TemplateStyling>;
  
  // Override branding
  customLogoUrl?: string;
  customHeader?: string;
  customFooter?: string;
  
  // QR Code settings
  showQrCode: boolean;
  qrCodeData?: {
    type: 'payment' | 'receipt' | 'property' | 'custom';
    url?: string;
    upiId?: string;
    customData?: string;
  };
  qrCodePosition?: string;
  qrCodeSize?: number;
  
  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Validation & Utility Types
// ============================================================================

export interface TemplateValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  warnings: Array<{
    field: string;
    message: string;
  }>;
}

export interface TemplateExportData {
  version: string;
  exportDate: string;
  template: TemplateConfiguration;
  customizations?: PropertyTemplateCustomization;
  metadata?: Record<string, any>;
}

// ============================================================================
// Constants
// ============================================================================

export const DEFAULT_LAYOUT: TemplateLayout = {
  margins: { top: 50, right: 50, bottom: 50, left: 50 },
  spacing: { section: 20, field: 10 },
  pageSize: 'A4',
  orientation: 'portrait',
  showHeader: true,
  showFooter: true,
};

export const DEFAULT_COLORS: ThemeColors = {
  primary: '#2563eb',
  secondary: '#64748b',
  accent: '#3b82f6',
  text: '#1e293b',
  textLight: '#64748b',
  background: '#ffffff',
  border: '#e2e8f0',
};

export const DEFAULT_FONTS: TemplateFonts = {
  heading: { family: 'Arial, sans-serif', size: 18, weight: 'bold', lineHeight: 1.4 },
  body: { family: 'Arial, sans-serif', size: 12, weight: 'normal', lineHeight: 1.6 },
  caption: { family: 'Arial, sans-serif', size: 10, weight: 'normal', lineHeight: 1.4 },
};

export const AVAILABLE_PAGE_SIZES = ['A4', 'Letter', 'Legal'] as const;
export const AVAILABLE_ORIENTATIONS = ['portrait', 'landscape'] as const;
export const AVAILABLE_TEMPLATE_TYPES = ['basic', 'professional', 'premium'] as const;
