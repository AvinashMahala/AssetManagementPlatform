import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Briefcase, Home } from 'lucide-react';
import { BaseForm, FormColumn, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, FormField } from '../../componentDesignLibrary';
import type { TenantInput } from '../../types/tenant';

interface TenantFormModernProps {
  initialData?: Partial<TenantInput>;
  onSubmit: (data: TenantInput) => Promise<void>;
  loading?: boolean;
}

const TenantFormModern: React.FC<TenantFormModernProps> = ({
  initialData,
  onSubmit,
  loading
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TenantInput>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    alternatePhone: initialData?.alternatePhone || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    gender: initialData?.gender,
    occupation: initialData?.occupation || '',
    companyName: initialData?.companyName || '',
    monthlyIncome: initialData?.monthlyIncome,
    currentAddress: {
      street: initialData?.currentAddress?.street || '',
      city: initialData?.currentAddress?.city || '',
      state: initialData?.currentAddress?.state || '',
      pincode: initialData?.currentAddress?.pincode || '',
    },
    permanentAddress: initialData?.permanentAddress ? {
      street: initialData.permanentAddress.street || '',
      city: initialData.permanentAddress.city || '',
      state: initialData.permanentAddress.state || '',
      pincode: initialData.permanentAddress.pincode || '',
    } : undefined,
    emergencyContact: initialData?.emergencyContact ? {
      name: initialData.emergencyContact.name || '',
      relationship: initialData.emergencyContact.relationship || '',
      phone: initialData.emergencyContact.phone || '',
    } : {
      name: '',
      relationship: '',
      phone: '',
    },
    status: initialData?.status || 'active',
    preferredLocations: initialData?.preferredLocations || [],
    notes: initialData?.notes || '',
  });

  const [showPermanentAddress, setShowPermanentAddress] = useState(
    !!initialData?.permanentAddress
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent as keyof TenantInput] as any, [field]: value }
    }));
    if (errors[`${parent}.${field}`]) {
      setErrors(prev => ({ ...prev, [`${parent}.${field}`]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length > 100) {
      newErrors.firstName = 'First name must be less than 100 characters';
    }

    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length > 100) {
      newErrors.lastName = 'Last name must be less than 100 characters';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (formData.email.length > 255) {
      newErrors.email = 'Email must be less than 255 characters';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Validate phone (optional but must be valid if provided)
    if (formData.phone && formData.phone.trim()) {
      const phonePattern = /^\+?[1-9]\d{1,14}$/;
      if (!phonePattern.test(formData.phone.replace(/[-\s]/g, ''))) {
        newErrors.phone = 'Invalid phone number format. Use international format (e.g., +1234567890)';
      }
    }

    // Validate alternate phone (optional but must be valid if provided)
    if (formData.alternatePhone && formData.alternatePhone.trim()) {
      const phonePattern = /^\+?[1-9]\d{1,14}$/;
      if (!phonePattern.test(formData.alternatePhone.replace(/[-\s]/g, ''))) {
        newErrors.alternatePhone = 'Invalid alternate phone format. Use international format';
      }
    }

    // Validate monthly income (must be non-negative)
    if (formData.monthlyIncome !== undefined && formData.monthlyIncome < 0) {
      newErrors.monthlyIncome = 'Monthly income cannot be negative';
    }

    // Validate current address
    if (!formData.currentAddress.street.trim()) {
      newErrors['currentAddress.street'] = 'Street address is required';
    } else if (formData.currentAddress.street.length > 255) {
      newErrors['currentAddress.street'] = 'Street address must be less than 255 characters';
    }

    if (!formData.currentAddress.city.trim()) {
      newErrors['currentAddress.city'] = 'City is required';
    } else if (formData.currentAddress.city.length > 100) {
      newErrors['currentAddress.city'] = 'City must be less than 100 characters';
    }

    if (!formData.currentAddress.state.trim()) {
      newErrors['currentAddress.state'] = 'State is required';
    } else if (formData.currentAddress.state.length > 100) {
      newErrors['currentAddress.state'] = 'State must be less than 100 characters';
    }

    if (!formData.currentAddress.pincode.trim()) {
      newErrors['currentAddress.pincode'] = 'Pincode is required';
    } else if (!/^\d{5,6}$/.test(formData.currentAddress.pincode)) {
      newErrors['currentAddress.pincode'] = 'Pincode must be a valid 5 or 6-digit number';
    }

    // Validate permanent address (optional but must be complete if any field is filled)
    if (formData.permanentAddress) {
      const hasAnyPermanentField = 
        formData.permanentAddress.street?.trim() ||
        formData.permanentAddress.city?.trim() ||
        formData.permanentAddress.state?.trim() ||
        formData.permanentAddress.pincode?.trim();

      if (hasAnyPermanentField) {
        if (!formData.permanentAddress.street?.trim()) {
          newErrors['permanentAddress.street'] = 'Street address is required';
        } else if (formData.permanentAddress.street.length > 255) {
          newErrors['permanentAddress.street'] = 'Street address must be less than 255 characters';
        }

        if (!formData.permanentAddress.city?.trim()) {
          newErrors['permanentAddress.city'] = 'City is required';
        } else if (formData.permanentAddress.city.length > 100) {
          newErrors['permanentAddress.city'] = 'City must be less than 100 characters';
        }

        if (!formData.permanentAddress.state?.trim()) {
          newErrors['permanentAddress.state'] = 'State is required';
        } else if (formData.permanentAddress.state.length > 100) {
          newErrors['permanentAddress.state'] = 'State must be less than 100 characters';
        }

        if (!formData.permanentAddress.pincode?.trim()) {
          newErrors['permanentAddress.pincode'] = 'Pincode is required';
        } else if (!/^\d{5,6}$/.test(formData.permanentAddress.pincode)) {
          newErrors['permanentAddress.pincode'] = 'Pincode must be a valid 5 or 6-digit number';
        }
      }
    }

    // Validate emergency contact (optional but must be complete if any field is filled)
    const hasAnyEmergencyField = 
      formData.emergencyContact?.name?.trim() ||
      formData.emergencyContact?.relationship?.trim() ||
      formData.emergencyContact?.phone?.trim();

    if (hasAnyEmergencyField) {
      if (!formData.emergencyContact?.name?.trim()) {
        newErrors['emergencyContact.name'] = 'Emergency contact name is required';
      } else if (formData.emergencyContact.name.length > 255) {
        newErrors['emergencyContact.name'] = 'Name must be less than 255 characters';
      }

      if (!formData.emergencyContact?.relationship?.trim()) {
        newErrors['emergencyContact.relationship'] = 'Relationship is required';
      } else if (formData.emergencyContact.relationship.length > 100) {
        newErrors['emergencyContact.relationship'] = 'Relationship must be less than 100 characters';
      }

      if (!formData.emergencyContact?.phone?.trim()) {
        newErrors['emergencyContact.phone'] = 'Emergency contact phone is required';
      } else {
        const phonePattern = /^\+?[1-9]\d{1,14}$/;
        if (!phonePattern.test(formData.emergencyContact.phone.replace(/[-\s]/g, ''))) {
          newErrors['emergencyContact.phone'] = 'Invalid phone format. Use international format';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    await onSubmit(formData);
  };

  const handleCancel = () => {
    navigate('/tenants');
  };

  return (
    <BaseForm
      title={initialData ? "Edit Tenant" : "Create Tenant"}
      backLabel="Back to Tenants"
      onBack={() => navigate(initialData ? `/tenants/${(initialData as any).id}` : '/tenants')}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      loading={loading}
      cancelLabel="Cancel"
      submitLabel={initialData ? "Update Tenant" : "Create Tenant"}
    >
      <FormColumn
        title="Basic Information"
        description="Personal details"
        icon={<User className="h-5 w-5" />}
      >
        <FormField label="First Name" required>
          <Input
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            error={errors.firstName}
            placeholder="Enter first name"
            className="h-10"
          />
        </FormField>

        <FormField label="Last Name" required>
          <Input
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            error={errors.lastName}
            placeholder="Enter last name"
            className="h-10"
          />
        </FormField>

        <FormField label="Email" required>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            placeholder="Enter email address"
            className="h-10"
          />
        </FormField>

        <FormField label="Phone">
          <Input
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={errors.phone}
            placeholder="+1234567890 (international format)"
            className="h-10"
          />
          {!errors.phone && (
            <p className="text-xs text-gray-500 mt-1">
              Use international format (e.g., +1234567890)
            </p>
          )}
        </FormField>

        <FormField label="Alternate Phone">
          <Input
            value={formData.alternatePhone}
            onChange={(e) => handleChange('alternatePhone', e.target.value)}
            error={errors.alternatePhone}
            placeholder="+0987654321 (international format)"
            className="h-10"
          />
        </FormField>

        <FormField label="Date of Birth">
          <Input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            className="h-10"
          />
        </FormField>

        <FormField label="Gender">
          <Select
            value={formData.gender || ''}
            onValueChange={(value) => handleChange('gender', value)}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </FormColumn>

      <FormColumn
        title="Current Address"
        description="Residential address"
        icon={<MapPin className="h-5 w-5" />}
      >
        <FormField label="Street Address" required>
          <Input
            value={formData.currentAddress.street}
            onChange={(e) => handleNestedChange('currentAddress', 'street', e.target.value)}
            error={errors['currentAddress.street']}
            placeholder="Enter street address"
            className="h-10"
          />
        </FormField>

        <FormField label="City" required>
          <Input
            value={formData.currentAddress.city}
            onChange={(e) => handleNestedChange('currentAddress', 'city', e.target.value)}
            error={errors['currentAddress.city']}
            placeholder="Enter city"
            className="h-10"
          />
        </FormField>

        <FormField label="State" required>
          <Input
            value={formData.currentAddress.state}
            onChange={(e) => handleNestedChange('currentAddress', 'state', e.target.value)}
            error={errors['currentAddress.state']}
            placeholder="Enter state"
            className="h-10"
          />
        </FormField>

        <FormField label="Pincode" required>
          <Input
            value={formData.currentAddress.pincode}
            onChange={(e) => handleNestedChange('currentAddress', 'pincode', e.target.value)}
            error={errors['currentAddress.pincode']}
            placeholder="12345 or 123456"
            maxLength={6}
            className="h-10"
          />
          {!errors['currentAddress.pincode'] && (
            <p className="text-xs text-gray-500 mt-1">
              Enter 5 or 6 digit pincode
            </p>
          )}
        </FormField>
      </FormColumn>

      {/* Permanent Address (Optional) */}
      <FormColumn
        title="Permanent Address (Optional)"
        description="Different from current address"
        icon={<MapPin className="h-5 w-5" />}
      >
        <div className="mb-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showPermanentAddress}
              onChange={(e) => {
                setShowPermanentAddress(e.target.checked);
                if (!e.target.checked) {
                  setFormData(prev => ({ ...prev, permanentAddress: undefined }));
                  // Clear permanent address errors
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors['permanentAddress.street'];
                    delete newErrors['permanentAddress.city'];
                    delete newErrors['permanentAddress.state'];
                    delete newErrors['permanentAddress.pincode'];
                    return newErrors;
                  });
                } else {
                  setFormData(prev => ({
                    ...prev,
                    permanentAddress: { street: '', city: '', state: '', pincode: '' }
                  }));
                }
              }}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Add permanent address (if different from current)
            </span>
          </label>
        </div>

        {showPermanentAddress && (
          <>
            <FormField label="Street Address">
              <Input
                value={formData.permanentAddress?.street || ''}
                onChange={(e) => handleNestedChange('permanentAddress', 'street', e.target.value)}
                error={errors['permanentAddress.street']}
                placeholder="Enter street address"
                className="h-10"
              />
            </FormField>

            <FormField label="City">
              <Input
                value={formData.permanentAddress?.city || ''}
                onChange={(e) => handleNestedChange('permanentAddress', 'city', e.target.value)}
                error={errors['permanentAddress.city']}
                placeholder="Enter city"
                className="h-10"
              />
            </FormField>

            <FormField label="State">
              <Input
                value={formData.permanentAddress?.state || ''}
                onChange={(e) => handleNestedChange('permanentAddress', 'state', e.target.value)}
                error={errors['permanentAddress.state']}
                placeholder="Enter state"
                className="h-10"
              />
            </FormField>

            <FormField label="Pincode">
              <Input
                value={formData.permanentAddress?.pincode || ''}
                onChange={(e) => handleNestedChange('permanentAddress', 'pincode', e.target.value)}
                error={errors['permanentAddress.pincode']}
                placeholder="12345 or 123456"
                maxLength={6}
                className="h-10"
              />
            </FormField>
          </>
        )}
      </FormColumn>

      <FormColumn
        title="Employment & Contact"
        description="Work details and emergency contact"
        icon={<Briefcase className="h-5 w-5" />}
      >
        <FormField label="Occupation">
          <Input
            value={formData.occupation}
            onChange={(e) => handleChange('occupation', e.target.value)}
            placeholder="Enter occupation"
            className="h-10"
          />
        </FormField>

        <FormField label="Company Name">
          <Input
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            placeholder="Enter company name"
            className="h-10"
          />
        </FormField>

        <FormField label="Monthly Income">
          <Input
            type="number"
            value={formData.monthlyIncome ?? ''}
            onChange={(e) =>
              handleChange(
                'monthlyIncome',
                e.target.value === '' ? undefined : Number(e.target.value)
              )
            }
            error={errors.monthlyIncome}
            placeholder="Enter monthly income"
            min="0"
            className="h-10"
          />
        </FormField>

        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Emergency Contact (Optional)</h4>

          <FormField label="Name">
            <Input
              value={formData.emergencyContact?.name || ''}
              onChange={(e) => handleNestedChange('emergencyContact', 'name', e.target.value)}
              error={errors['emergencyContact.name']}
              placeholder="Contact name"
              className="h-10"
            />
          </FormField>

          <FormField label="Relationship">
            <Input
              value={formData.emergencyContact?.relationship || ''}
              onChange={(e) => handleNestedChange('emergencyContact', 'relationship', e.target.value)}
              error={errors['emergencyContact.relationship']}
              placeholder="Relationship"
              className="h-10"
            />
          </FormField>

          <FormField label="Phone">
            <Input
              value={formData.emergencyContact?.phone || ''}
              onChange={(e) => handleNestedChange('emergencyContact', 'phone', e.target.value)}
              error={errors['emergencyContact.phone']}
              placeholder="Phone number"
              className="h-10"
            />
          </FormField>
        </div>

        <FormField label="Notes">
          <Textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Enter any additional notes..."
            rows={3}
            className="resize-none"
          />
        </FormField>
      </FormColumn>
    </BaseForm>
  );
};

export default TenantFormModern;