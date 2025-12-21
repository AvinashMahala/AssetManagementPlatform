import React from 'react';
import { User, Phone, Mail, Globe, Plus, X } from 'lucide-react';
import { FormField, Input, Button } from '@/componentDesignLibrary';
import type { OwnerContact } from '@/features/properties/types';

interface OwnerContactFormProps {
  value: OwnerContact;
  onChange: (value: OwnerContact) => void;
  errors?: Record<string, string>;
  isEdit?: boolean;
  readOnlyName?: boolean;
}

const OwnerContactForm: React.FC<OwnerContactFormProps> = ({ value, onChange, errors, isEdit = false, readOnlyName = false }) => {
  const handleChange = (field: keyof OwnerContact, fieldValue: any) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const addMobileNumber = () => {
    if (value.mobileNumbers.length < 5) {
      handleChange('mobileNumbers', [...value.mobileNumbers, '']);
    }
  };

  const removeMobileNumber = (index: number) => {
    handleChange('mobileNumbers', value.mobileNumbers.filter((_, i) => i !== index));
  };

  const updateMobileNumber = (index: number, phone: string) => {
    const updated = [...value.mobileNumbers];
    updated[index] = phone;
    handleChange('mobileNumbers', updated);
  };

  const addEmailId = () => {
    if (value.emailIds.length < 5) {
      handleChange('emailIds', [...value.emailIds, '']);
    }
  };

  const removeEmailId = (index: number) => {
    handleChange('emailIds', value.emailIds.filter((_, i) => i !== index));
  };

  const updateEmailId = (index: number, email: string) => {
    const updated = [...value.emailIds];
    updated[index] = email;
    handleChange('emailIds', updated);
  };

  return (
    <div className="space-y-6">
      <FormField label="Owner Name" required={!isEdit}>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={value.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors?.name}
            placeholder="Enter owner's full name"
            className="pl-10 h-10"
            disabled={readOnlyName}
          />
        </div>
      </FormField>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Mobile Numbers (up to 5)
          </label>
          {value.mobileNumbers.length < 5 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMobileNumber}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Number
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {value.mobileNumbers.map((number, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={number}
                  onChange={(e) => updateMobileNumber(index, e.target.value)}
                  placeholder={`Mobile number ${index + 1}`}
                  className="pl-10 h-10"
                  type="tel"
                  error={index === 0 ? errors?.mobile : undefined}
                />
              </div>
              {value.mobileNumbers.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeMobileNumber(index)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email IDs (up to 5)
          </label>
          {value.emailIds.length < 5 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addEmailId}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Email
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {value.emailIds.map((email, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={email}
                  onChange={(e) => updateEmailId(index, e.target.value)}
                  placeholder={`Email address ${index + 1}`}
                  className="pl-10 h-10"
                  type="email"
                  error={index === 0 ? errors?.email : undefined}
                />
              </div>
              {value.emailIds.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeEmailId(index)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <FormField label="Website">
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={value.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://example.com"
            className="pl-10 h-10"
            type="url"
          />
        </div>
      </FormField>
    </div>
  );
};

export default OwnerContactForm;