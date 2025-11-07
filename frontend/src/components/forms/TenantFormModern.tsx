import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Briefcase, Home, AlertCircle, CheckCircle } from 'lucide-react';
import { BaseForm, FormColumn, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, FormField } from '../../componentDesignLibrary';
import type { TenantInput } from '../../types/tenant';

interface TenantFormModernProps {
  initialData?: Partial<TenantInput>;
  onSubmit: (data: TenantInput) => Promise<void>;
  loading?: boolean;
}

// Validation helper functions
const formatPhoneForValidation = (phone: string): string => {
  return phone.replace(/[-\s()]/g, '');
};

const isValidPhone = (phone: string): boolean => {
  if (!phone) return true; // Optional field
  const cleaned = formatPhoneForValidation(phone);
  return /^\+?[1-9]\d{1,14}$/.test(cleaned);
};

const isValidPincode = (pincode: string): boolean => {
  return /^\d{5,6}$/.test(pincode);
};

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

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
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Mark field as touched
  const markTouched = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Real-time validation effect
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    let formIsValid = true;

    // Validate first name
    if (touched.firstName) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
        formIsValid = false;
      } else if (formData.firstName.length > 100) {
        newErrors.firstName = 'First name must be less than 100 characters';
        formIsValid = false;
      }
    }

    // Validate last name
    if (touched.lastName) {
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
        formIsValid = false;
      } else if (formData.lastName.length > 100) {
        newErrors.lastName = 'Last name must be less than 100 characters';
        formIsValid = false;
      }
    }

    // Validate email
    if (touched.email) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
        formIsValid = false;
      } else if (formData.email.length > 255) {
        newErrors.email = 'Email must be less than 255 characters';
        formIsValid = false;
      } else if (!isValidEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
        formIsValid = false;
      }
    }

    // Validate phone (optional but must be valid if provided)
    if (formData.phone && formData.phone.trim()) {
      if (!isValidPhone(formData.phone)) {
        newErrors.phone = 'Invalid phone format. Use international format (e.g., +1234567890)';
        formIsValid = false;
      }
    }

    // Validate alternate phone (optional but must be valid if provided)
    if (formData.alternatePhone && formData.alternatePhone.trim()) {
      if (!isValidPhone(formData.alternatePhone)) {
        newErrors.alternatePhone = 'Invalid phone format. Use international format';
        formIsValid = false;
      }
    }

    // Validate monthly income
    if (formData.monthlyIncome !== undefined && formData.monthlyIncome < 0) {
      newErrors.monthlyIncome = 'Monthly income cannot be negative';
      formIsValid = false;
    }

    // Validate current address (always required)
    if (touched['currentAddress.street']) {
      if (!formData.currentAddress.street.trim()) {
        newErrors['currentAddress.street'] = 'Street address is required';
        formIsValid = false;
      } else if (formData.currentAddress.street.length > 255) {
        newErrors['currentAddress.street'] = 'Street address must be less than 255 characters';
        formIsValid = false;
      }
    }

    if (touched['currentAddress.city']) {
      if (!formData.currentAddress.city.trim()) {
        newErrors['currentAddress.city'] = 'City is required';
        formIsValid = false;
      } else if (formData.currentAddress.city.length > 100) {
        newErrors['currentAddress.city'] = 'City must be less than 100 characters';
        formIsValid = false;
      }
    }

    if (touched['currentAddress.state']) {
      if (!formData.currentAddress.state.trim()) {
        newErrors['currentAddress.state'] = 'State is required';
        formIsValid = false;
      } else if (formData.currentAddress.state.length > 100) {
        newErrors['currentAddress.state'] = 'State must be less than 100 characters';
        formIsValid = false;
      }
    }

    if (touched['currentAddress.pincode']) {
      if (!formData.currentAddress.pincode.trim()) {
        newErrors['currentAddress.pincode'] = 'Pincode is required';
        formIsValid = false;
      } else if (!isValidPincode(formData.currentAddress.pincode)) {
        newErrors['currentAddress.pincode'] = 'Pincode must be 5 or 6 digits';
        formIsValid = false;
      }
    }

    // Validate permanent address (optional but must be complete if any field is filled)
    if (showPermanentAddress && formData.permanentAddress) {
      const hasAnyPermanentField = 
        formData.permanentAddress.street?.trim() ||
        formData.permanentAddress.city?.trim() ||
        formData.permanentAddress.state?.trim() ||
        formData.permanentAddress.pincode?.trim();

      if (hasAnyPermanentField) {
        if (!formData.permanentAddress.street?.trim()) {
          newErrors['permanentAddress.street'] = 'Street address is required';
          formIsValid = false;
        } else if (formData.permanentAddress.street.length > 255) {
          newErrors['permanentAddress.street'] = 'Must be less than 255 characters';
          formIsValid = false;
        }

        if (!formData.permanentAddress.city?.trim()) {
          newErrors['permanentAddress.city'] = 'City is required';
          formIsValid = false;
        } else if (formData.permanentAddress.city.length > 100) {
          newErrors['permanentAddress.city'] = 'Must be less than 100 characters';
          formIsValid = false;
        }

        if (!formData.permanentAddress.state?.trim()) {
          newErrors['permanentAddress.state'] = 'State is required';
          formIsValid = false;
        } else if (formData.permanentAddress.state.length > 100) {
          newErrors['permanentAddress.state'] = 'Must be less than 100 characters';
          formIsValid = false;
        }

        if (!formData.permanentAddress.pincode?.trim()) {
          newErrors['permanentAddress.pincode'] = 'Pincode is required';
          formIsValid = false;
        } else if (!isValidPincode(formData.permanentAddress.pincode)) {
          newErrors['permanentAddress.pincode'] = 'Must be 5 or 6 digits';
          formIsValid = false;
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
        newErrors['emergencyContact.name'] = 'Name is required';
        formIsValid = false;
      } else if (formData.emergencyContact.name.length > 255) {
        newErrors['emergencyContact.name'] = 'Must be less than 255 characters';
        formIsValid = false;
      }

      if (!formData.emergencyContact?.relationship?.trim()) {
        newErrors['emergencyContact.relationship'] = 'Relationship is required';
        formIsValid = false;
      } else if (formData.emergencyContact.relationship.length > 100) {
        newErrors['emergencyContact.relationship'] = 'Must be less than 100 characters';
        formIsValid = false;
      }

      if (!formData.emergencyContact?.phone?.trim()) {
        newErrors['emergencyContact.phone'] = 'Phone is required';
        formIsValid = false;
      } else if (!isValidPhone(formData.emergencyContact.phone)) {
        newErrors['emergencyContact.phone'] = 'Invalid phone format';
        formIsValid = false;
      }
    }

    // Check if required fields are filled (for form validity)
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() ||
        !formData.currentAddress.street.trim() || !formData.currentAddress.city.trim() ||
        !formData.currentAddress.state.trim() || !formData.currentAddress.pincode.trim()) {
      formIsValid = false;
    }

    setErrors(newErrors);
    setIsFormValid(formIsValid && Object.keys(newErrors).length === 0);
  }, [formData, touched, showPermanentAddress]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    markTouched(field);
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent as keyof TenantInput] as any, [field]: value }
    }));
    markTouched(`${parent}.${field}`);
  };

  const scrollToFirstError = () => {
    // Wait a bit for errors to be rendered in DOM
    setTimeout(() => {
      const firstErrorField = document.querySelector('[data-error="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
        
        // Try to focus the input if it's an input element
        const inputElement = firstErrorField.querySelector('input, textarea, select');
        if (inputElement instanceof HTMLElement) {
          inputElement.focus();
        }
      }
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // First mark all fields as touched
    const allFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'alternatePhone',
      'currentAddress.street',
      'currentAddress.city',
      'currentAddress.state',
      'currentAddress.pincode'
    ];
    
    const newTouched: Record<string, boolean> = {};
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(prev => ({ ...prev, ...newTouched }));

    // Wait for validation to complete
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Check if form is valid
    if (!isFormValid) {
      scrollToFirstError();
      return;
    }

    // Clean up data before submitting - remove empty emergency contact if not filled
    const dataToSubmit = { ...formData };
    const hasEmergencyContact = 
      formData.emergencyContact?.name?.trim() ||
      formData.emergencyContact?.relationship?.trim() ||
      formData.emergencyContact?.phone?.trim();
    
    if (!hasEmergencyContact) {
      dataToSubmit.emergencyContact = undefined;
    }

    // Remove permanent address if not filled
    if (!showPermanentAddress) {
      dataToSubmit.permanentAddress = undefined;
    }

    await onSubmit(dataToSubmit);
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
            onBlur={() => markTouched('firstName')}
            error={errors.firstName}
            placeholder="Enter first name"
            className="h-10"
            data-error={!!errors.firstName}
            maxLength={100}
          />
        </FormField>

        <FormField label="Last Name" required>
          <Input
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            onBlur={() => markTouched('lastName')}
            error={errors.lastName}
            placeholder="Enter last name"
            className="h-10"
            data-error={!!errors.lastName}
            maxLength={100}
          />
        </FormField>

        <FormField label="Email" required>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => markTouched('email')}
            error={errors.email}
            placeholder="tenant@example.com"
            className="h-10"
            data-error={!!errors.email}
            maxLength={255}
          />
          {!errors.email && formData.email && isValidEmail(formData.email) && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Valid email address
            </p>
          )}
        </FormField>

        <FormField label="Phone">
          <Input
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => markTouched('phone')}
            error={errors.phone}
            placeholder="+1234567890"
            className="h-10"
            data-error={!!errors.phone}
          />
          {!errors.phone && formData.phone && isValidPhone(formData.phone) && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Valid phone number
            </p>
          )}
          {!errors.phone && !formData.phone && (
            <p className="text-xs text-gray-500 mt-1">
              Optional. Use international format (e.g., +919876543210 for India, +1234567890 for US)
            </p>
          )}
        </FormField>

        <FormField label="Alternate Phone">
          <Input
            value={formData.alternatePhone}
            onChange={(e) => handleChange('alternatePhone', e.target.value)}
            onBlur={() => markTouched('alternatePhone')}
            error={errors.alternatePhone}
            placeholder="+0987654321"
            className="h-10"
            data-error={!!errors.alternatePhone}
          />
          {!errors.alternatePhone && formData.alternatePhone && isValidPhone(formData.alternatePhone) && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Valid phone number
            </p>
          )}
          {!errors.alternatePhone && !formData.alternatePhone && (
            <p className="text-xs text-gray-500 mt-1">
              Optional. Provide an alternative contact number
            </p>
          )}
        </FormField>

        <FormField label="Date of Birth">
          <Input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            className="h-10"
            max={new Date().toISOString().split('T')[0]}
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional. Must be a past date
          </p>
        </FormField>

        <FormField label="Gender">
          <Select
            value={formData.gender || ''}
            onValueChange={(value) => handleChange('gender', value)}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select gender (optional)" />
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
            onBlur={() => markTouched('currentAddress.street')}
            error={errors['currentAddress.street']}
            placeholder="Building name, street name, area"
            className="h-10"
            data-error={!!errors['currentAddress.street']}
            maxLength={255}
          />
        </FormField>

        <FormField label="City" required>
          <Input
            value={formData.currentAddress.city}
            onChange={(e) => handleNestedChange('currentAddress', 'city', e.target.value)}
            onBlur={() => markTouched('currentAddress.city')}
            error={errors['currentAddress.city']}
            placeholder="City name"
            className="h-10"
            data-error={!!errors['currentAddress.city']}
            maxLength={100}
          />
        </FormField>

        <FormField label="State" required>
          <Input
            value={formData.currentAddress.state}
            onChange={(e) => handleNestedChange('currentAddress', 'state', e.target.value)}
            onBlur={() => markTouched('currentAddress.state')}
            error={errors['currentAddress.state']}
            placeholder="State/Province"
            className="h-10"
            data-error={!!errors['currentAddress.state']}
            maxLength={100}
          />
        </FormField>

        <FormField label="Pincode" required>
          <Input
            value={formData.currentAddress.pincode}
            onChange={(e) => {
              // Only allow digits
              const value = e.target.value.replace(/\D/g, '');
              handleNestedChange('currentAddress', 'pincode', value);
            }}
            onBlur={() => markTouched('currentAddress.pincode')}
            error={errors['currentAddress.pincode']}
            placeholder="12345 or 123456"
            maxLength={6}
            className="h-10"
            data-error={!!errors['currentAddress.pincode']}
          />
          {!errors['currentAddress.pincode'] && formData.currentAddress.pincode && isValidPincode(formData.currentAddress.pincode) && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Valid pincode
            </p>
          )}
          {!errors['currentAddress.pincode'] && !formData.currentAddress.pincode && (
            <p className="text-xs text-gray-500 mt-1">
              Enter 5 or 6 digit postal code
            </p>
          )}
        </FormField>
      </FormColumn>

      {/* Permanent Address (Optional) */}
      <FormColumn
        title="Permanent Address (Optional)"
        description="Different from current address"
        icon={<Home className="h-5 w-5" />}
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
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                If you start filling permanent address, all fields become required
              </p>
            </div>

            <FormField label="Street Address">
              <Input
                value={formData.permanentAddress?.street || ''}
                onChange={(e) => handleNestedChange('permanentAddress', 'street', e.target.value)}
                error={errors['permanentAddress.street']}
                placeholder="Building name, street name, area"
                className="h-10"
                data-error={!!errors['permanentAddress.street']}
                maxLength={255}
              />
            </FormField>

            <FormField label="City">
              <Input
                value={formData.permanentAddress?.city || ''}
                onChange={(e) => handleNestedChange('permanentAddress', 'city', e.target.value)}
                error={errors['permanentAddress.city']}
                placeholder="City name"
                className="h-10"
                data-error={!!errors['permanentAddress.city']}
                maxLength={100}
              />
            </FormField>

            <FormField label="State">
              <Input
                value={formData.permanentAddress?.state || ''}
                onChange={(e) => handleNestedChange('permanentAddress', 'state', e.target.value)}
                error={errors['permanentAddress.state']}
                placeholder="State/Province"
                className="h-10"
                data-error={!!errors['permanentAddress.state']}
                maxLength={100}
              />
            </FormField>

            <FormField label="Pincode">
              <Input
                value={formData.permanentAddress?.pincode || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  handleNestedChange('permanentAddress', 'pincode', value);
                }}
                error={errors['permanentAddress.pincode']}
                placeholder="12345 or 123456"
                maxLength={6}
                className="h-10"
                data-error={!!errors['permanentAddress.pincode']}
              />
              {!errors['permanentAddress.pincode'] && formData.permanentAddress?.pincode && isValidPincode(formData.permanentAddress.pincode) && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Valid pincode
                </p>
              )}
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
            placeholder="Software Engineer, Teacher, etc."
            className="h-10"
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">Optional</p>
        </FormField>

        <FormField label="Company Name">
          <Input
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            placeholder="Company or organization name"
            className="h-10"
            maxLength={255}
          />
          <p className="text-xs text-gray-500 mt-1">Optional</p>
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
            placeholder="0.00"
            min="0"
            step="0.01"
            className="h-10"
          />
          <p className="text-xs text-gray-500 mt-1">Optional. Enter amount in your local currency</p>
        </FormField>

        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Emergency Contact</h4>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
            <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Optional. If you start filling emergency contact, all three fields become required
            </p>
          </div>

          <FormField label="Name">
            <Input
              value={formData.emergencyContact?.name || ''}
              onChange={(e) => handleNestedChange('emergencyContact', 'name', e.target.value)}
              error={errors['emergencyContact.name']}
              placeholder="Contact person name"
              className="h-10"
              data-error={!!errors['emergencyContact.name']}
              maxLength={255}
            />
          </FormField>

          <FormField label="Relationship">
            <Input
              value={formData.emergencyContact?.relationship || ''}
              onChange={(e) => handleNestedChange('emergencyContact', 'relationship', e.target.value)}
              error={errors['emergencyContact.relationship']}
              placeholder="Spouse, Parent, Sibling, Friend, etc."
              className="h-10"
              data-error={!!errors['emergencyContact.relationship']}
              maxLength={100}
            />
          </FormField>

          <FormField label="Phone">
            <Input
              value={formData.emergencyContact?.phone || ''}
              onChange={(e) => handleNestedChange('emergencyContact', 'phone', e.target.value)}
              error={errors['emergencyContact.phone']}
              placeholder="+1234567890"
              className="h-10"
              data-error={!!errors['emergencyContact.phone']}
            />
            {!errors['emergencyContact.phone'] && formData.emergencyContact?.phone && isValidPhone(formData.emergencyContact.phone) && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Valid phone number
              </p>
            )}
          </FormField>
        </div>

        <FormField label="Notes">
          <Textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Enter any additional notes or special requirements..."
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional. Add any additional information about the tenant
          </p>
        </FormField>
      </FormColumn>
    </BaseForm>
  );
};

export default TenantFormModern;