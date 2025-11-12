import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Home, User, Star, Upload, FileText } from 'lucide-react';
import { BaseForm, FormColumn, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, FormField, Badge } from '../../componentDesignLibrary';
import type { PropertyInput, PropertyReceiptTemplate } from '../../types';
import { PropertyType, PropertyStatus } from '../../types/property';
import { getCurrencyOptions, DEFAULT_CURRENCY } from '../../types/currency';
import { useUser } from '../../hooks';
import { useAuth } from '../../hooks';
import OwnerContactForm from './OwnerContactForm';
import EnhancedAmenitiesForm from './EnhancedAmenitiesForm';
import PropertyFileUpload from './PropertyFileUpload';
import ReceiptTemplateForm from './ReceiptTemplateForm';

interface PropertyFormModernProps {
  initialData?: Partial<PropertyInput>;
  onSubmit: (data: PropertyInput) => Promise<void>;
  loading?: boolean;
  isEdit?: boolean;
  propertyName?: string;
}

const AMENITIES = ['Parking', 'Lift', 'Security', 'Gym', 'Power Backup', 'Water Supply', 'Garden', 'Swimming Pool'];

const PropertyFormModern: React.FC<PropertyFormModernProps> = ({ initialData, onSubmit, loading, isEdit = false, propertyName }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { data: owner, loading: ownerLoading } = useUser(initialData?.ownerId && initialData.ownerId.trim() ? initialData.ownerId : (!isEdit ? currentUser?.id || '' : null));

  // Update owner details when owner data is loaded
  React.useEffect(() => {
    if (owner && !ownerLoading) {
      setFormData(prev => ({
        ...prev,
        ownerDetails: {
          ...prev.ownerDetails,
          name: owner.name || owner.username || prev.ownerDetails.name || ''
        }
      }));
    }
  }, [owner, ownerLoading]);
  const [formData, setFormData] = useState<PropertyInput>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    propertyType: initialData?.propertyType || PropertyType.APARTMENT,
    status: (initialData?.status && Object.values(PropertyStatus).includes(initialData.status as any)) 
      ? initialData.status 
      : PropertyStatus.AVAILABLE,
    currency: initialData?.currency || DEFAULT_CURRENCY,
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
    ownerDetails: initialData?.ownerDetails ? {
      name: initialData.ownerDetails.name || '',
      mobileNumbers: initialData.ownerDetails.mobileNumbers || [''],
      emailIds: initialData.ownerDetails.emailIds || [''],
      website: initialData.ownerDetails.website || ''
    } : {
      name: '',
      mobileNumbers: [''],
      emailIds: [''],
      website: ''
    },
    amenities: initialData?.amenities || {
      basic: [],
      luxury: [],
      additionalInfo: {
        petFriendly: false,
        smokingAllowed: false,
        eventsAllowed: false
      }
    },
    files: initialData?.files || [],
    receiptTemplate: initialData?.receiptTemplate || {
      bankDetails: {
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        accountHolderName: ''
      },
      wallets: [],
      additionalInfo: {}
    },
    ownerId: initialData?.ownerId || (!isEdit ? currentUser?.id || '' : ''),
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
    if (!isEdit && !formData.ownerId) newErrors.ownerId = 'Owner ID is required';
    if (!isEdit && !formData.ownerDetails.name) newErrors.ownerName = 'Owner name is required';
    if (!isEdit && !formData.ownerDetails.mobileNumbers[0]) newErrors.ownerMobile = 'At least one mobile number is required';
    if (!isEdit && !formData.ownerDetails.emailIds[0]) newErrors.ownerEmail = 'At least one email ID is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit(formData);
  };

  const handleCancel = () => {
    navigate('/properties');
  };

  return (
    <BaseForm
      title={isEdit ? `Edit ${propertyName || 'Property'}` : "Create Property"}
      backLabel={isEdit ? "Edit Property" : "Back to Properties"}
      onBack={() => navigate('/properties')}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      loading={loading}
      cancelLabel="Cancel"
      submitLabel={isEdit ? "Update Property" : "Create Property"}
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

        <FormField label="Currency" required>
          <Select value={formData.currency} onValueChange={(value) => handleChange('currency', value)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {getCurrencyOptions().map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Owner Name" required>
          <Input
            id="ownerName"
            value={owner?.name || owner?.username || formData.ownerDetails.name || ''}
            onChange={(e) => handleChange('ownerDetails', { ...formData.ownerDetails, name: e.target.value })}
            error={errors.ownerName}
            placeholder={ownerLoading ? "Loading owner..." : "Enter owner name"}
            className="h-10"
            disabled={ownerLoading}
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

      <FormColumn
        title="Owner Contact Details"
        description="Property owner information and contact details"
        icon={<User className="h-5 w-5" />}
      >
        <OwnerContactForm
          value={formData.ownerDetails}
          onChange={(value) => handleChange('ownerDetails', value)}
          isEdit={isEdit}
          errors={{
            name: errors.ownerName,
            mobile: errors.ownerMobile,
            email: errors.ownerEmail
          }}
        />
      </FormColumn>

      <FormColumn
        title="Enhanced Amenities"
        description="Basic and luxury amenities with additional property rules"
        icon={<Star className="h-5 w-5" />}
      >
        <EnhancedAmenitiesForm
          value={formData.amenities || {
            basic: [],
            luxury: [],
            additionalInfo: {
              petFriendly: false,
              smokingAllowed: false,
              eventsAllowed: false
            }
          }}
          onChange={(value) => handleChange('amenities', value)}
        />
      </FormColumn>

      <FormColumn
        title="Property Files"
        description="Upload photos and documents for the property"
        icon={<Upload className="h-5 w-5" />}
      >
        <PropertyFileUpload
          files={formData.files || []}
          onFilesChange={(files) => handleChange('files', files)}
        />
      </FormColumn>

      <FormColumn
        title="Receipt Template"
        description="Configure payment details and receipt settings"
        icon={<FileText className="h-5 w-5" />}
      >
        <ReceiptTemplateForm
          value={{
            ...formData.receiptTemplate!,
            propertyId: '' // This will be set when saving
          } as PropertyReceiptTemplate}
          onChange={(value) => handleChange('receiptTemplate', value)}
        />
      </FormColumn>
    </BaseForm>
  );
};

export default PropertyFormModern;
