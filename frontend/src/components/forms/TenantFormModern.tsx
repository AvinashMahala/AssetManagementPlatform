import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Briefcase } from 'lucide-react';
import { BaseForm, FormColumn, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, FormField } from '../../cdc';
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
    emergencyContact: {
      name: initialData?.emergencyContact?.name || '',
      relationship: initialData?.emergencyContact?.relationship || '',
      phone: initialData?.emergencyContact?.phone || '',
    },
    status: initialData?.status || 'active',
    preferredLocations: initialData?.preferredLocations || [],
    notes: initialData?.notes || '',
  });

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

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    if (!formData.currentAddress.street.trim()) newErrors['currentAddress.street'] = 'Street is required';
    if (!formData.currentAddress.city.trim()) newErrors['currentAddress.city'] = 'City is required';
    if (!formData.currentAddress.state.trim()) newErrors['currentAddress.state'] = 'State is required';
    if (!formData.currentAddress.pincode.trim()) newErrors['currentAddress.pincode'] = 'Pincode is required';

    if (!formData.emergencyContact.name.trim()) newErrors['emergencyContact.name'] = 'Emergency contact name is required';
    if (!formData.emergencyContact.relationship.trim()) newErrors['emergencyContact.relationship'] = 'Relationship is required';
    if (!formData.emergencyContact.phone.trim()) newErrors['emergencyContact.phone'] = 'Emergency phone is required';

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
      title="Create Tenant"
      backLabel="Back to Tenants"
      onBack={() => navigate('/tenants')}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      loading={loading}
      cancelLabel="Cancel"
      submitLabel="Create Tenant"
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
            placeholder="Enter phone number"
            className="h-10"
          />
        </FormField>

        <FormField label="Alternate Phone">
          <Input
            value={formData.alternatePhone}
            onChange={(e) => handleChange('alternatePhone', e.target.value)}
            placeholder="Enter alternate phone"
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
            placeholder="Enter pincode"
            className="h-10"
          />
        </FormField>
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
            value={formData.monthlyIncome || ''}
            onChange={(e) => handleChange('monthlyIncome', Number(e.target.value))}
            placeholder="Enter monthly income"
            className="h-10"
          />
        </FormField>

        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Emergency Contact</h4>

          <FormField label="Name" required>
            <Input
              value={formData.emergencyContact.name}
              onChange={(e) => handleNestedChange('emergencyContact', 'name', e.target.value)}
              error={errors['emergencyContact.name']}
              placeholder="Contact name"
              className="h-10"
            />
          </FormField>

          <FormField label="Relationship" required>
            <Input
              value={formData.emergencyContact.relationship}
              onChange={(e) => handleNestedChange('emergencyContact', 'relationship', e.target.value)}
              error={errors['emergencyContact.relationship']}
              placeholder="Relationship"
              className="h-10"
            />
          </FormField>

          <FormField label="Phone" required>
            <Input
              value={formData.emergencyContact.phone}
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