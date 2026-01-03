import { generateUPILink, copyUPILink, openUPIApp } from '@/utils/upiUtils';
import { CreditCard, Smartphone, QrCode, FileSignature, Image, Plus, X, Copy, ExternalLink } from 'lucide-react';
import { FormField, Input, Textarea, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/componentDesignLibrary';
import type { PropertyReceiptTemplate, BankDetails, WalletDetails } from '@/features/properties/types';

interface ReceiptTemplateFormProps {
  value: PropertyReceiptTemplate | Partial<PropertyReceiptTemplate>;
  onChange: (value: PropertyReceiptTemplate | Partial<PropertyReceiptTemplate>) => void;
}

const WALLET_TYPES = [
  { value: 'PAYTM', label: 'Paytm' },
  { value: 'PHONEPE', label: 'PhonePe' },
  { value: 'GPAY', label: 'Google Pay' },
  { value: 'AMAZONPAY', label: 'Amazon Pay' },
  { value: 'OTHER', label: 'Other' }
] as const;

const ReceiptTemplateForm: React.FC<ReceiptTemplateFormProps> = ({ value, onChange }) => {
  const DEFAULT_TEMPLATE: PropertyReceiptTemplate = {
    propertyId: '',
    bankDetails: {
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      accountHolderName: ''
    },
    wallets: [],
    additionalInfo: {}
  };

  const safeValue: PropertyReceiptTemplate = {
    ...DEFAULT_TEMPLATE,
    ...(value as Partial<PropertyReceiptTemplate>),
    bankDetails: {
      ...DEFAULT_TEMPLATE.bankDetails,
      ...(value?.bankDetails || {})
    },
    wallets: value?.wallets ?? [],
    additionalInfo: {
      ...DEFAULT_TEMPLATE.additionalInfo,
      ...(value?.additionalInfo || {})
    }
  };

  const handleChange = (field: keyof PropertyReceiptTemplate, fieldValue: any) => {
    onChange({ ...safeValue, [field]: fieldValue });
  };

  const handleBankDetailsChange = (field: keyof BankDetails, fieldValue: string) => {
    handleChange('bankDetails', {
      ...safeValue.bankDetails,
      [field]: fieldValue
    });
  };

  const addWallet = () => {
    const newWallet: WalletDetails = {
      type: 'PAYTM',
      upiPhoneNumber: '',
      upiName: '',
      upiId: '',
      generateUPILinks: true
    };
    handleChange('wallets', [...safeValue.wallets, newWallet]);
  };

  const removeWallet = (index: number) => {
    handleChange('wallets', safeValue.wallets.filter((_, i) => i !== index));
  };

  const updateWallet = (index: number, field: keyof WalletDetails, fieldValue: any) => {
    const updated = [...safeValue.wallets];
    updated[index] = { ...updated[index], [field]: fieldValue };
    handleChange('wallets', updated);
  }; 

  const handleAdditionalInfoChange = (field: string, fieldValue: string) => {
    handleChange('additionalInfo', {
      ...safeValue.additionalInfo,
      [field]: fieldValue
    });
  };

  const handleFileChange = (field: 'paymentQRCodeFile' | 'signatureFile' | 'watermarkFile', file: File | null) => {
    handleChange(field, file);
  };

  return (
    <div className="space-y-8">
      {/* Bank Details Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Bank Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Bank Name" required>
            <Input
              value={safeValue.bankDetails.bankName}
              onChange={(e) => handleBankDetailsChange('bankName', e.target.value)}
              placeholder="e.g., HDFC Bank"
            />
          </FormField>

          <FormField label="Account Holder Name" required>
            <Input
              value={safeValue.bankDetails.accountHolderName}
              onChange={(e) => handleBankDetailsChange('accountHolderName', e.target.value)}
              placeholder="Account holder name"
            />
          </FormField>

          <FormField label="Account Number" required>
            <Input
              value={safeValue.bankDetails.accountNumber}
              onChange={(e) => handleBankDetailsChange('accountNumber', e.target.value)}
              placeholder="Account number"
            />
          </FormField>

          <FormField label="IFSC Code" required>
            <Input
              value={safeValue.bankDetails.ifscCode}
              onChange={(e) => handleBankDetailsChange('ifscCode', e.target.value)}
              placeholder="e.g., HDFC0001234"
            />
          </FormField>
        </div>
      </div>

      {/* UPI Wallets Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-medium text-gray-900">UPI Wallets</h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addWallet}
            className="flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Add Wallet
          </Button>
        </div>

        <div className="space-y-4">
          {safeValue.wallets.map((wallet, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">Wallet {index + 1}</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeWallet(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Wallet Type">
                  <Select
                    value={wallet.type}
                    onValueChange={(value) => updateWallet(index, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WALLET_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Phone Number">
                  <Input
                    value={wallet.upiPhoneNumber}
                    onChange={(e) => updateWallet(index, 'upiPhoneNumber', e.target.value)}
                    placeholder="Registered phone number"
                    type="tel"
                  />
                </FormField>

                <FormField label="UPI Name">
                  <Input
                    value={wallet.upiName}
                    onChange={(e) => updateWallet(index, 'upiName', e.target.value)}
                    placeholder="Display name"
                  />
                </FormField>

                <FormField label="UPI ID" required>
                  <Input
                    value={wallet.upiId}
                    onChange={(e) => updateWallet(index, 'upiId', e.target.value)}
                    placeholder="e.g., user@paytm"
                  />
                </FormField>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`generateLinks-${index}`}
                  checked={wallet.generateUPILinks}
                  onChange={(e) => updateWallet(index, 'generateUPILinks', e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor={`generateLinks-${index}`} className="text-sm text-gray-700">
                  Generate UPI payment links
                </label>
              </div>

              {wallet.generateUPILinks && wallet.upiId && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 mb-1">UPI Payment Link:</p>
                      <p className="text-sm font-mono text-gray-800 break-all">
                        {generateUPILink(wallet)}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyUPILink(wallet)}
                        className="p-1"
                        title="Copy UPI link"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openUPIApp(wallet)}
                        className="p-1"
                        title="Open in UPI app"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {safeValue.wallets.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Smartphone className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>No UPI wallets added yet</p>
              <p className="text-sm">Add wallets to enable UPI payments</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment QR Code */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-medium text-gray-900">Payment QR Code</h3>
        </div>

        <FormField label="Upload QR Code Image">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange('paymentQRCodeFile', e.target.files?.[0] || null)}
              className="hidden"
              id="qr-code-upload"
            />
            <label htmlFor="qr-code-upload" className="cursor-pointer flex flex-col items-center">
              <QrCode className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Click to upload QR code</span>
              <span className="text-xs text-gray-500">PNG, JPG up to 5MB</span>
            </label>
          </div>
        </FormField>
      </div>

      {/* Signature and Watermark */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-medium text-gray-900">Signature</h3>
          </div>

          <FormField label="Upload Signature Image">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('signatureFile', e.target.files?.[0] || null)}
                className="hidden"
                id="signature-upload"
              />
              <label htmlFor="signature-upload" className="cursor-pointer flex flex-col items-center">
                <FileSignature className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Click to upload signature</span>
                <span className="text-xs text-gray-500">PNG, JPG up to 2MB</span>
              </label>
            </div>
          </FormField>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-medium text-gray-900">Watermark</h3>
          </div>

          <FormField label="Upload Watermark Image">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('watermarkFile', e.target.files?.[0] || null)}
                className="hidden"
                id="watermark-upload"
              />
              <label htmlFor="watermark-upload" className="cursor-pointer flex flex-col items-center">
                <Image className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Click to upload watermark</span>
                <span className="text-xs text-gray-500">PNG, JPG up to 2MB</span>
              </label>
            </div>
          </FormField>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Additional Receipt Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Terms and Conditions">
            <Textarea
              value={safeValue.additionalInfo.termsAndConditions || ''}
              onChange={(e) => handleAdditionalInfoChange('termsAndConditions', e.target.value)}
              placeholder="Enter terms and conditions for receipts..."
              rows={3}
            />
          </FormField>

          <FormField label="Payment Instructions">
            <Textarea
              value={safeValue.additionalInfo.paymentInstructions || ''}
              onChange={(e) => handleAdditionalInfoChange('paymentInstructions', e.target.value)}
              placeholder="Enter payment instructions..."
              rows={3}
            />
          </FormField>

          <FormField label="Contact Information">
            <Textarea
              value={safeValue.additionalInfo.contactInfo || ''}
              onChange={(e) => handleAdditionalInfoChange('contactInfo', e.target.value)}
              placeholder="Enter contact information..."
              rows={2}
            />
          </FormField>

          <FormField label="Custom Footer">
            <Textarea
              value={safeValue.additionalInfo.customFooter || ''}
              onChange={(e) => handleAdditionalInfoChange('customFooter', e.target.value)}
              placeholder="Enter custom footer text..."
              rows={2}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
};

export default ReceiptTemplateForm;