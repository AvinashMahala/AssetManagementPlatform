import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Briefcase, Phone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { FormField } from '../../components/ui/form-field';
import type { TenantInput } from '../../types/tenant';

interface TenantFormModernProps {
  initialData?: Partial<TenantInput>;
  onSubmit: (data: TenantInput) => Promise<void>;
  loading?: boolean;
  title?: string;
}

const TenantFormModern: React.FC<TenantFormModernProps> = ({
  initialData,
  onSubmit,
  loading,
  title = 'Create Tenant'
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/tenants')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tenants
        </Button>

        <div className="flex items-center gap-3">
          <User className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-1">Add a new tenant to the system</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Enter the tenant's personal details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="First Name" required>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  error={errors.firstName}
                  placeholder="Enter first name"
                />
              </FormField>

              <FormField label="Last Name" required>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  error={errors.lastName}
                  placeholder="Enter last name"
                />
              </FormField>

              <FormField label="Email" required>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  error={errors.email}
                  placeholder="Enter email address"
                />
              </FormField>

              <FormField label="Phone">
                <Input
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </FormField>

              <FormField label="Alternate Phone">
                <Input
                  value={formData.alternatePhone}
                  onChange={(e) => handleChange('alternatePhone', e.target.value)}
                  placeholder="Enter alternate phone"
                />
              </FormField>

              <FormField label="Date of Birth">
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                />
              </FormField>

              <FormField label="Gender">
                <Select
                  value={formData.gender || ''}
                  onValueChange={(value) => handleChange('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Employment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Employment Information
            </CardTitle>
            <CardDescription>
              Details about the tenant's occupation and income
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Occupation">
                <Input
                  value={formData.occupation}
                  onChange={(e) => handleChange('occupation', e.target.value)}
                  placeholder="Enter occupation"
                />
              </FormField>

              <FormField label="Company Name">
                <Input
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  placeholder="Enter company name"
                />
              </FormField>

              <FormField label="Monthly Income">
                <Input
                  type="number"
                  value={formData.monthlyIncome || ''}
                  onChange={(e) => handleChange('monthlyIncome', Number(e.target.value))}
                  placeholder="Enter monthly income"
                />
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Current Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Current Address
            </CardTitle>
            <CardDescription>
              The tenant's current residential address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Street Address" required>
              <Input
                value={formData.currentAddress.street}
                onChange={(e) => handleNestedChange('currentAddress', 'street', e.target.value)}
                error={errors['currentAddress.street']}
                placeholder="Enter street address"
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="City" required>
                <Input
                  value={formData.currentAddress.city}
                  onChange={(e) => handleNestedChange('currentAddress', 'city', e.target.value)}
                  error={errors['currentAddress.city']}
                  placeholder="Enter city"
                />
              </FormField>

              <FormField label="State" required>
                <Input
                  value={formData.currentAddress.state}
                  onChange={(e) => handleNestedChange('currentAddress', 'state', e.target.value)}
                  error={errors['currentAddress.state']}
                  placeholder="Enter state"
                />
              </FormField>

              <FormField label="Pincode" required>
                <Input
                  value={formData.currentAddress.pincode}
                  onChange={(e) => handleNestedChange('currentAddress', 'pincode', e.target.value)}
                  error={errors['currentAddress.pincode']}
                  placeholder="Enter pincode"
                />
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Emergency Contact
            </CardTitle>
            <CardDescription>
              Emergency contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Name" required>
                <Input
                  value={formData.emergencyContact.name}
                  onChange={(e) => handleNestedChange('emergencyContact', 'name', e.target.value)}
                  error={errors['emergencyContact.name']}
                  placeholder="Contact name"
                />
              </FormField>

              <FormField label="Relationship" required>
                <Input
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => handleNestedChange('emergencyContact', 'relationship', e.target.value)}
                  error={errors['emergencyContact.relationship']}
                  placeholder="Relationship"
                />
              </FormField>

              <FormField label="Phone" required>
                <Input
                  value={formData.emergencyContact.phone}
                  onChange={(e) => handleNestedChange('emergencyContact', 'phone', e.target.value)}
                  error={errors['emergencyContact.phone']}
                  placeholder="Phone number"
                />
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>
              Any additional notes or information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField label="Notes">
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Enter any additional notes..."
                rows={4}
              />
            </FormField>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/tenants')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Tenant'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TenantFormModern;