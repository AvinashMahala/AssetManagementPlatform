import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, DollarSign, Settings } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { BaseForm, FormColumn, FormField } from '../../componentDesignLibrary';
import { useProperties } from '../../hooks';
import type { UnitInput } from '../../types/unit';
import { UnitStatus, UnitType } from '../../types/unit';

interface UnitFormModernProps {
  initialData?: Partial<UnitInput>;
  onSubmit: (data: UnitInput) => Promise<void>;
  loading?: boolean;
}

const COMMON_AMENITIES = [
  'WiFi', 'AC', 'TV', 'Washing Machine', 'Microwave',
  'Fridge', 'Water Heater', 'Balcony', 'Parking', 'Security'
];

const UnitFormModern: React.FC<UnitFormModernProps> = ({
  initialData,
  onSubmit,
  loading
}) => {
  const navigate = useNavigate();
  const { properties: availableProperties, loading: propertiesLoading } = useProperties();
  const [formData, setFormData] = useState<UnitInput>({
    propertyId: initialData?.propertyId || '',
    unitNumber: initialData?.unitNumber || '',
    floor: initialData?.floor || 0,
    unitType: initialData?.unitType || UnitType.APARTMENT,
    status: initialData?.status || UnitStatus.AVAILABLE,
    area: initialData?.area || 0,
    bedrooms: initialData?.bedrooms || 2,
    bathrooms: initialData?.bathrooms || 2,
    balconies: initialData?.balconies || 1,
    furnished: initialData?.furnished || false,
    monthlyRent: initialData?.monthlyRent || 0,
    securityDeposit: initialData?.securityDeposit || 0,
    maintenanceCharges: initialData?.maintenanceCharges || 0,
    unitAmenities: initialData?.unitAmenities || [],
    unitPhotos: initialData?.unitPhotos || [],
    description: initialData?.description || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleRemoveAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      unitAmenities: (prev.unitAmenities || []).filter((a: string) => a !== amenity)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.propertyId && !initialData?.propertyId) newErrors.propertyId = 'Property is required';
    if (!formData.unitNumber.trim()) newErrors.unitNumber = 'Unit number is required';
    if (formData.area <= 0) newErrors.area = 'Area must be greater than 0';
    if (formData.bedrooms && formData.bedrooms < 0) newErrors.bedrooms = 'Bedrooms cannot be negative';
    if (formData.bathrooms && formData.bathrooms < 0) newErrors.bathrooms = 'Bathrooms cannot be negative';
    if (formData.monthlyRent < 0) newErrors.monthlyRent = 'Monthly rent cannot be negative';
    if (formData.securityDeposit < 0) newErrors.securityDeposit = 'Security deposit cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    await onSubmit(formData);
  };

  const handleCancel = () => {
    navigate('/units');
  };

  return (
    <BaseForm
      title="Create Unit"
      backLabel="Back to Units"
      onBack={() => navigate('/units')}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      loading={loading}
      cancelLabel="Cancel"
      submitLabel="Create Unit"
    >
      <FormColumn
        title="Basic Information"
        description="Unit identification and type"
        icon={<Home className="h-5 w-5" />}
      >
        <FormField label="Property" required>
          <Select
            value={formData.propertyId}
            onValueChange={(value) => handleChange('propertyId', value)}
            disabled={propertiesLoading || !!initialData?.propertyId}
          >
            <SelectTrigger error={errors.propertyId} className="h-10">
              <SelectValue placeholder={propertiesLoading ? "Loading properties..." : "Select a property"} />
            </SelectTrigger>
            <SelectContent>
              {availableProperties?.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {initialData?.propertyId && (
            <p className="text-sm text-muted-foreground mt-1">
              Property is pre-selected from the current context
            </p>
          )}
        </FormField>

        <FormField label="Unit Number" required>
          <Input
            value={formData.unitNumber}
            onChange={(e) => handleChange('unitNumber', e.target.value)}
            error={errors.unitNumber}
            placeholder="e.g., 101, A-201"
            className="h-10"
          />
        </FormField>

        <FormField label="Floor">
          <Input
            type="number"
            value={formData.floor}
            onChange={(e) => handleChange('floor', Number(e.target.value))}
            placeholder="Ground floor = 0"
            className="h-10"
          />
        </FormField>

        <FormField label="Unit Type" required>
          <Select
            value={formData.unitType}
            onValueChange={(value) => handleChange('unitType', value)}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select unit type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UnitType.APARTMENT}>Apartment</SelectItem>
              <SelectItem value={UnitType.HOUSE}>House</SelectItem>
              <SelectItem value={UnitType.VILLA}>Villa</SelectItem>
              <SelectItem value={UnitType.STUDIO}>Studio</SelectItem>
              <SelectItem value={UnitType.ROOM}>Room</SelectItem>
              <SelectItem value={UnitType.COMMERCIAL}>Commercial</SelectItem>
              <SelectItem value={UnitType.OFFICE}>Office</SelectItem>
              <SelectItem value={UnitType.SHOP}>Shop</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Status" required>
          <Select
            value={formData.status}
            onValueChange={(value) => handleChange('status', value)}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UnitStatus.AVAILABLE}>Available</SelectItem>
              <SelectItem value={UnitStatus.OCCUPIED}>Occupied</SelectItem>
              <SelectItem value={UnitStatus.UNDER_MAINTENANCE}>Under Maintenance</SelectItem>
              <SelectItem value={UnitStatus.VACANT}>Vacant</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Furnished">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="furnished"
              checked={formData.furnished}
              onChange={(e) => handleChange('furnished', e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="furnished" className="text-sm font-medium">
              This unit is furnished
            </label>
          </div>
        </FormField>
      </FormColumn>

      <FormColumn
        title="Area & Rooms"
        description="Physical specifications"
        icon={<Settings className="h-5 w-5" />}
      >
        <FormField label="Area (sq ft)" required>
          <Input
            type="number"
            value={formData.area}
            onChange={(e) => handleChange('area', Number(e.target.value))}
            error={errors.area}
            min="0"
            className="h-10"
          />
        </FormField>

        <FormField label="Bedrooms" required>
          <Input
            type="number"
            value={formData.bedrooms}
            onChange={(e) => handleChange('bedrooms', Number(e.target.value))}
            error={errors.bedrooms}
            min="0"
            className="h-10"
          />
        </FormField>

        <FormField label="Bathrooms" required>
          <Input
            type="number"
            value={formData.bathrooms}
            onChange={(e) => handleChange('bathrooms', Number(e.target.value))}
            error={errors.bathrooms}
            min="0"
            className="h-10"
          />
        </FormField>

        <FormField label="Balconies">
          <Input
            type="number"
            value={formData.balconies}
            onChange={(e) => handleChange('balconies', Number(e.target.value))}
            min="0"
            className="h-10"
          />
        </FormField>
      </FormColumn>

      <FormColumn
        title="Financial & Details"
        description="Rent, deposits, and amenities"
        icon={<DollarSign className="h-5 w-5" />}
      >
        <FormField label="Monthly Rent (₹)" required>
          <Input
            type="number"
            value={formData.monthlyRent}
            onChange={(e) => handleChange('monthlyRent', Number(e.target.value))}
            error={errors.monthlyRent}
            min="0"
            className="h-10"
          />
        </FormField>

        <FormField label="Security Deposit (₹)" required>
          <Input
            type="number"
            value={formData.securityDeposit}
            onChange={(e) => handleChange('securityDeposit', Number(e.target.value))}
            error={errors.securityDeposit}
            min="0"
            className="h-10"
          />
        </FormField>

        <FormField label="Maintenance Charges (₹)">
          <Input
            type="number"
            value={formData.maintenanceCharges}
            onChange={(e) => handleChange('maintenanceCharges', Number(e.target.value))}
            min="0"
            className="h-10"
          />
        </FormField>

        <FormField label="Description">
          <Textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter unit description..."
            rows={3}
            className="resize-none"
          />
        </FormField>

        <FormField label="Amenities">
          <div className="grid grid-cols-2 gap-2">
            {COMMON_AMENITIES.map(amenity => (
              <Badge
                key={amenity}
                variant={formData.unitAmenities?.includes(amenity) ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/80 transition-colors justify-center py-2 px-3 text-xs h-auto"
                onClick={() => {
                  if (formData.unitAmenities?.includes(amenity)) {
                    handleRemoveAmenity(amenity);
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      unitAmenities: [...(prev.unitAmenities || []), amenity]
                    }));
                  }
                }}
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

export default UnitFormModern;