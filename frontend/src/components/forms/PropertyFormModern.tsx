import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Home } from 'lucide-react';
import { BaseForm, FormColumn, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, FormField, Badge } from '../../cdc';
import type { PropertyInput } from '../../types';
import { PropertyType, PropertyStatus } from '../../types/property';

interface PropertyFormModernProps {
  initialData?: Partial<PropertyInput>;
  onSubmit: (data: PropertyInput) => Promise<void>;
  loading?: boolean;
}

const AMENITIES = ['Parking', 'Lift', 'Security', 'Gym', 'Power Backup', 'Water Supply', 'Garden', 'Swimming Pool'];

const PropertyFormModern: React.FC<PropertyFormModernProps> = ({ initialData, onSubmit, loading }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PropertyInput>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    propertyType: initialData?.propertyType || PropertyType.APARTMENT,
    status: initialData?.status || PropertyStatus.AVAILABLE,
    address: {
      street: initialData?.address?.street || '',
      city: initialData?.address?.city || '',
      state: initialData?.address?.state || '',
      pincode: initialData?.address?.pincode || '',
      landmark: initialData?.address?.landmark || '',
    },
    totalArea: initialData?.totalArea || 0,
    totalFloors: initialData?.totalFloors || undefined,
    yearBuilt: initialData?.yearBuilt || undefined,
    parkingSpaces: initialData?.parkingSpaces || undefined,
    buildingAmenities: initialData?.buildingAmenities || [],
    buildingPhotos: initialData?.buildingPhotos || [],
    ownerId: initialData?.ownerId || '',
    coOwners: initialData?.coOwners || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleAddressChange = (field: keyof PropertyInput['address'], value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      buildingAmenities: prev.buildingAmenities?.includes(amenity)
        ? prev.buildingAmenities.filter(a => a !== amenity)
        : [...(prev.buildingAmenities || []), amenity]
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Property name is required';
    if (!formData.address.street) newErrors.street = 'Street address is required';
    if (!formData.address.city) newErrors.city = 'City is required';
    if (!formData.address.state) newErrors.state = 'State is required';
    if (!formData.address.pincode) newErrors.pincode = 'Pincode is required';
    if (!formData.totalArea || formData.totalArea <= 0) newErrors.totalArea = 'Valid area is required';
    if (!formData.ownerId) newErrors.ownerId = 'Owner ID is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const handleCancel = () => {
    navigate('/properties');
  };

  return (
    <BaseForm
      title="Create Property"
      backLabel="Back to Properties"
      onBack={() => navigate('/properties')}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      loading={loading}
      cancelLabel="Cancel"
      submitLabel="Create Property"
    >
      <FormColumn
        title="Basic Information"
        description="Essential property details"
        icon={<Building2 className="h-5 w-5" />}
      >
        <FormField label="Property Name" required>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            placeholder="Enter property name"
            className="h-10"
          />
        </FormField>

        <FormField label="Property Type" required>
          <Select value={formData.propertyType} onValueChange={(value) => handleChange('propertyType', value)}>
            <SelectTrigger error={errors.propertyType} className="h-10">
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(PropertyType).map(type => (
                <SelectItem key={type} value={type}>
                  {type.replace('_', ' ').toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Status" required>
          <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(PropertyStatus).map(status => (
                <SelectItem key={status} value={status}>
                  {status.replace('_', ' ').toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Owner ID" required>
          <Input
            id="ownerId"
            value={formData.ownerId}
            onChange={(e) => handleChange('ownerId', e.target.value)}
            error={errors.ownerId}
            placeholder="Enter owner ID"
            className="h-10"
          />
        </FormField>

        <FormField label="Description">
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter property description"
            rows={4}
            className="resize-none"
          />
        </FormField>
      </FormColumn>

      <FormColumn
        title="Address Details"
        description="Complete property location"
        icon={<MapPin className="h-5 w-5" />}
      >
        <FormField label="Street Address" required>
          <Input
            id="street"
            value={formData.address.street}
            onChange={(e) => handleAddressChange('street', e.target.value)}
            error={errors.street}
            placeholder="Enter street address"
            className="h-10"
          />
        </FormField>

        <FormField label="City" required>
          <Input
            id="city"
            value={formData.address.city}
            onChange={(e) => handleAddressChange('city', e.target.value)}
            error={errors.city}
            placeholder="Enter city"
            className="h-10"
          />
        </FormField>

        <FormField label="State" required>
          <Input
            id="state"
            value={formData.address.state}
            onChange={(e) => handleAddressChange('state', e.target.value)}
            error={errors.state}
            placeholder="Enter state"
            className="h-10"
          />
        </FormField>

        <FormField label="Pincode" required>
          <Input
            id="pincode"
            value={formData.address.pincode}
            onChange={(e) => handleAddressChange('pincode', e.target.value)}
            error={errors.pincode}
            placeholder="Enter pincode"
            className="h-10"
          />
        </FormField>

        <FormField label="Landmark">
          <Input
            id="landmark"
            value={formData.address.landmark}
            onChange={(e) => handleAddressChange('landmark', e.target.value)}
            placeholder="Enter landmark (optional)"
            className="h-10"
          />
        </FormField>
      </FormColumn>

      <FormColumn
        title="Specifications"
        description="Property specifications and amenities"
        icon={<Home className="h-5 w-5" />}
      >
        <FormField label="Total Area (sq ft)" required>
          <Input
            id="totalArea"
            type="number"
            value={formData.totalArea}
            onChange={(e) => handleChange('totalArea', Number(e.target.value))}
            error={errors.totalArea}
            placeholder="Enter total area"
            className="h-10"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Total Floors">
            <Input
              id="totalFloors"
              type="number"
              value={formData.totalFloors || ''}
              onChange={(e) => handleChange('totalFloors', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Floors"
              className="h-10"
            />
          </FormField>

          <FormField label="Year Built">
            <Input
              id="yearBuilt"
              type="number"
              value={formData.yearBuilt || ''}
              onChange={(e) => handleChange('yearBuilt', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Year"
              className="h-10"
            />
          </FormField>
        </div>

        <FormField label="Parking Spaces">
          <Input
            id="parkingSpaces"
            type="number"
            value={formData.parkingSpaces || ''}
            onChange={(e) => handleChange('parkingSpaces', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Enter parking spaces"
            className="h-10"
          />
        </FormField>

        <FormField label="Building Amenities">
          <div className="grid grid-cols-2 gap-2">
            {AMENITIES.map(amenity => (
              <Badge
                key={amenity}
                variant={formData.buildingAmenities?.includes(amenity) ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/80 transition-colors justify-center py-2 px-3 text-xs h-auto"
                onClick={() => toggleAmenity(amenity)}
              >
                {amenity}
              </Badge>
            ))}
          </div>
        </FormField>
      </FormColumn>
    </BaseForm>
  );
};

export default PropertyFormModern;
