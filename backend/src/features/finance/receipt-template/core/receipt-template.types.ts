
export enum ReceiptTemplateType {
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  PREMIUM = 'premium'
}

export interface ReceiptTemplate {
  id: string;
  name: string;
  type: ReceiptTemplateType;
  description: string;
  defaultSettings: ReceiptTemplateSettings;
  templateHtml?: string;
  templateCss?: any;
  layoutConfig?: any;
  placeholders?: any;
  previewImageUrl?: string;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReceiptTemplateSettings {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    fontSize: 'small' | 'medium' | 'large';
  };
  layout: {
    showLogo: boolean;
    logoPosition: 'top-left' | 'top-center' | 'top-right';
    showWatermark: boolean;
    watermarkText?: string;
    paperSize: 'a4' | 'letter';
    orientation: 'portrait' | 'landscape';
  };
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
  paymentOptions: {
    showBankDetails: boolean;
    showUPI: boolean;
    showQRCode: boolean;
    showWallets: boolean;
  };
  numbering: {
    prefix: string;
    startNumber: number;
    includeYear: boolean;
    includeMonth: boolean;
  };
}

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

export interface PropertyTemplateSelection {
  templateId: string;
  overrides?: Partial<ReceiptTemplateSettings>;
}
