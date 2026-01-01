import { PreviewSampleData, DEFAULT_SAMPLE_DATA } from '@/features/finance/receipt-template/core/types/template-preview.types';

export class SampleDataGenerator {
  static generateDefault(): PreviewSampleData {
    return { ...DEFAULT_SAMPLE_DATA };
  }

  static generateForProperty(propertyData: any): PreviewSampleData {
    return {
      ...DEFAULT_SAMPLE_DATA,
      property: {
        id: propertyData.id,
        name: propertyData.name || 'Sample Property',
        address: {
          street: propertyData.addressStreet || '123 Main Street',
          city: propertyData.addressCity || 'Mumbai',
          state: propertyData.addressState || 'Maharashtra',
          pincode: propertyData.addressPincode || '400001',
          country: propertyData.addressCountry || 'India',
        },
        phone: propertyData.phone || '+91-9876543210',
        email: propertyData.email || 'info@property.com',
        type: propertyData.propertyType || 'Residential',
      },
    };
  }

  static generateForReceipt(receiptData: any): PreviewSampleData {
    const sampleData = this.generateDefault();
    
    if (receiptData.property) {
      sampleData.property = {
        id: receiptData.property.id,
        name: receiptData.property.name,
        address: {
          street: receiptData.property.addressStreet,
          city: receiptData.property.addressCity,
          state: receiptData.property.addressState,
          pincode: receiptData.property.addressPincode,
          country: receiptData.property.addressCountry || 'India',
        },
        phone: receiptData.property.phone || '',
        email: receiptData.property.email || '',
      };
    }
    
    if (receiptData.tenant) {
      sampleData.tenant = {
        id: receiptData.tenant.id,
        name: `${receiptData.tenant.firstName} ${receiptData.tenant.lastName}`,
        email: receiptData.tenant.email,
        phone: receiptData.tenant.phone,
        address: {
          street: receiptData.tenant.currentAddressStreet || '',
          city: receiptData.tenant.currentAddressCity || '',
          state: receiptData.tenant.currentAddressState || '',
          pincode: receiptData.tenant.currentAddressPincode || '',
        },
      };
    }
    
    if (receiptData.payment) {
      sampleData.payment = {
        id: receiptData.payment.id,
        amount: receiptData.payment.amount,
        date: receiptData.payment.paymentDate,
        method: receiptData.payment.paymentMethod || 'Cash',
        reference: receiptData.payment.transactionReference,
        status: receiptData.payment.status,
      };
    }
    
    return sampleData;
  }
}
