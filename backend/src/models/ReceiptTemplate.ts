// Receipt Template Types
export enum ReceiptTemplateType {
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  PREMIUM = 'premium'
}

// Receipt Template model for predefined templates
export interface ReceiptTemplate {
  id: string; // UUID
  name: string; // Template name (e.g., "Basic Template", "Professional Template")
  type: ReceiptTemplateType; // Template category
  description: string; // Template description

  // Template settings (default values that can be overridden)
  defaultSettings: ReceiptTemplateSettings;

  // Template content (optional HTML/CSS for custom templates)
  templateHtml?: string;
  templateCss?: any; // JSONB
  layoutConfig?: any; // JSONB
  placeholders?: any; // JSONB
  previewImageUrl?: string;

  // Template metadata
  isActive: boolean; // Whether template is available for selection
  isDefault: boolean; // Whether this is the default template for new properties
  sortOrder: number; // Display order in UI

  // Audit fields
  createdAt: Date;
  updatedAt: Date;
}

// Template settings structure
export interface ReceiptTemplateSettings {
  // Visual settings
  theme: {
    primaryColor: string; // Hex color code
    secondaryColor: string; // Hex color code
    fontFamily: string; // Font family name
    fontSize: 'small' | 'medium' | 'large';
  };

  // Layout settings
  layout: {
    showLogo: boolean;
    logoPosition: 'top-left' | 'top-center' | 'top-right';
    showWatermark: boolean;
    watermarkText?: string;
    paperSize: 'a4' | 'letter';
    orientation: 'portrait' | 'landscape';
  };

  // Content settings
  content: {
    showPropertyAddress: boolean;
    showTenantAddress: boolean;
    showPaymentBreakdown: boolean;
    showBalanceForward: boolean;
    showTermsAndConditions: boolean;
    termsAndConditionsText?: string;
    showSignature: boolean;
    signatureText?: string;
  };

  // Payment options display
  paymentOptions: {
    showBankDetails: boolean;
    showUPI: boolean;
    showQRCode: boolean;
    showWallets: boolean;
  };

  // Receipt numbering
  numbering: {
    prefix: string; // e.g., "REC", "RNT", "INV"
    startNumber: number; // Starting number for auto-generation
    includeYear: boolean; // Include year in receipt number
    includeMonth: boolean; // Include month in receipt number
  };
}

// Template input for creation/updates
export interface ReceiptTemplateInput {
  name: string;
  type: ReceiptTemplateType;
  description: string;
  defaultSettings: ReceiptTemplateSettings;
  templateHtml?: string;
  templateCss?: any;
  layoutConfig?: any;
  placeholders?: any;
  previewImageUrl?: string;
  isActive?: boolean;
  isDefault?: boolean;
  sortOrder?: number;
}

// Template selection for properties
export interface PropertyTemplateSelection {
  templateId: string;
  overrides?: Partial<ReceiptTemplateSettings>; // Property-specific overrides
}