
/**
 * Template Preview Models
 * Interfaces for template preview generation and caching
 */

import { PropertyTemplateCustomization } from './template-customization.types';

// ============================================================================
// Preview Request & Response
// ============================================================================

export interface PreviewRequest {
  templateId: string;
  propertyId?: string;
  sampleData?: PreviewSampleData;
  customizations?: Partial<PropertyTemplateCustomization>;
  format?: 'html' | 'pdf' | 'both';
  quality?: 'low' | 'medium' | 'high';
}

export interface PreviewResponse {
  success: boolean;
  previewHtml?: string;
  previewPdfUrl?: string;
  previewImageUrl?: string;
  expiresAt: Date;
  cacheKey?: string;
  generationTime?: number; // milliseconds
  error?: string;
}

// ============================================================================
// Sample Data for Preview
// ============================================================================

export interface PreviewSampleData {
  property: SampleProperty;
  landlord: SampleLandlord;
  tenant: SampleTenant;
  unit: SampleUnit;
  lease: SampleLease;
  payment: SamplePayment;
  receipt: SampleReceipt;
  breakdown: SampleBreakdown;
}

export interface SampleProperty {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  phone: string;
  email: string;
  type?: string;
}

export interface SampleLandlord {
  name: string;
  email: string;
  phone: string;
  address?: string;
  panNumber?: string;
}

export interface SampleTenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface SampleUnit {
  id: string;
  unitNumber: string;
  unitName?: string;
  type?: string;
  floor?: number;
  area?: number;
}

export interface SampleLease {
  id: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
}

export interface SamplePayment {
  id: string;
  amount: number;
  date: string;
  method: string;
  reference?: string;
  transactionId?: string;
  status: string;
}

export interface SampleReceipt {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  generatedBy?: string;
}

export interface SampleBreakdown {
  previousBalance: number;
  baseRent: number;
  maintenanceCharges?: number;
  waterCharges?: number;
  electricityCharges?: number;
  otherCharges?: number;
  lateFeesCharged?: number;
  totalAmount: number;
  amountPaid: number;
  balance: number;
}

// ============================================================================
// Preview Cache
// ============================================================================

export interface TemplatePreviewCache {
  id: string;
  templateId: string;
  propertyId?: string;
  sampleData: PreviewSampleData;
  previewHtml?: string;
  previewPdfUrl?: string;
  previewExpiresAt: Date;
  createdAt: Date;
}

export interface CacheOptions {
  ttl: number;              // Time to live in seconds
  includeHtml: boolean;
  includePdf: boolean;
  includeImage: boolean;
}

// ============================================================================
// Preview Generation Options
// ============================================================================

export interface PreviewGenerationOptions {
  // Output format
  format: 'html' | 'pdf' | 'both';
  
  // Quality settings
  pdfQuality: 'low' | 'medium' | 'high';
  imageQuality?: number;    // 1-100 for image preview
  
  // Caching
  useCache: boolean;
  cacheResults: boolean;
  cacheTTL?: number;        // seconds
  
  // Watermark for preview
  addPreviewWatermark: boolean;
  watermarkText?: string;
  
  // Data options
  useSampleData: boolean;
  highlightPlaceholders: boolean;
  showPlaceholderLabels: boolean;
}

// ============================================================================
// Preview Validation
// ============================================================================

export interface PreviewValidation {
  isValid: boolean;
  missingPlaceholders: string[];
  invalidData: Array<{
    field: string;
    issue: string;
  }>;
  warnings: string[];
}

// ============================================================================
// PDF Generation Status
// ============================================================================

export interface PDFGenerationStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;         // 0-100
  startedAt: Date;
  completedAt?: Date;
  pdfUrl?: string;
  error?: string;
}

// ============================================================================
// Preview Comparison (for A/B testing templates)
// ============================================================================

export interface TemplateComparison {
  templateA: {
    id: string;
    name: string;
    previewUrl: string;
  };
  templateB: {
    id: string;
    name: string;
    previewUrl: string;
  };
  sampleData: PreviewSampleData;
  differences: Array<{
    aspect: string;
    description: string;
  }>;
}

// ============================================================================
// Default Sample Data
// ============================================================================

export const DEFAULT_SAMPLE_DATA: PreviewSampleData = {
  property: {
    id: 'sample-property-id',
    name: 'Sunrise Apartments',
    address: {
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
    },
    phone: '+91-9876543210',
    email: 'info@sunriseapartments.com',
    type: 'Residential',
  },
  landlord: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91-9876543211',
    address: '456 Owner Street, Mumbai, Maharashtra 400002',
    panNumber: 'ABCDE1234F',
  },
  tenant: {
    id: 'sample-tenant-id',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+91-9876543212',
    address: {
      street: '789 Tenant Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400003',
    },
  },
  unit: {
    id: 'sample-unit-id',
    unitNumber: 'A-101',
    unitName: 'Apartment A-101',
    type: '2BHK',
    floor: 1,
    area: 1200,
  },
  lease: {
    id: 'sample-lease-id',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    monthlyRent: 25000,
    securityDeposit: 75000,
  },
  payment: {
    id: 'sample-payment-id',
    amount: 25000,
    date: '2024-11-01',
    method: 'UPI',
    reference: 'UPI123456789',
    transactionId: 'TXN987654321',
    status: 'completed',
  },
  receipt: {
    id: 'sample-receipt-id',
    receiptNumber: 'REC-2024-11-001',
    receiptDate: '2024-11-04',
    generatedBy: 'System',
  },
  breakdown: {
    previousBalance: 0,
    baseRent: 25000,
    maintenanceCharges: 2000,
    waterCharges: 500,
    electricityCharges: 1500,
    otherCharges: 0,
    lateFeesCharged: 0,
    totalAmount: 29000,
    amountPaid: 29000,
    balance: 0,
  },
};

export const DEFAULT_PREVIEW_OPTIONS: PreviewGenerationOptions = {
  format: 'both',
  pdfQuality: 'medium',
  imageQuality: 85,
  useCache: true,
  cacheResults: true,
  cacheTTL: 300, // 5 minutes
  addPreviewWatermark: true,
  watermarkText: 'PREVIEW ONLY',
  useSampleData: true,
  highlightPlaceholders: false,
  showPlaceholderLabels: false,
};

export const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  ttl: 300, // 5 minutes
  includeHtml: true,
  includePdf: true,
  includeImage: true,
};
