import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import navigateBackOrFallback from '../../../utils/navigation';
import {
  Building2,
  MapPin,
  Home,
  User,
  Star,
  Upload,
  FileText,
  CheckCircle
} from 'lucide-react';
import {
  FormColumn,
  FormGrid,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  FormField,
  Badge,
  GenericTabbedForm
} from '../../../componentDesignLibrary';
import { Tabs, TabsContent } from '../../../components/ui/tabs';
import type { PropertyInput, PropertyReceiptTemplate, ApiError } from '../../../types';
import { PropertyType, PropertyStatus } from '../../../types/property';
import { getCurrencyOptions, DEFAULT_CURRENCY } from '../../../types/currency';
import { useUser, useUsers } from '../../../hooks';
import { useAuth } from '../../../hooks';
import OwnerContactForm from '../../../components/forms/OwnerContactForm';
import EnhancedAmenitiesForm from '../../../components/forms/EnhancedAmenitiesForm';
import PropertyFileUpload from '../../../components/forms/PropertyFileUpload';
import ReceiptTemplateForm from '../../../components/forms/ReceiptTemplateForm';

interface PropertyFormTabbedProps {
  initialData?: Partial<PropertyInput>;
  onSubmit: (data: PropertyInput) => Promise<void>;
  loading?: boolean;
  isEdit?: boolean;
  propertyName?: string;
  propertyId?: string;
  apiError?: ApiError | null;
}

const AMENITIES = ['Parking', 'Lift', 'Security', 'Gym', 'Power Backup', 'Water Supply', 'Garden', 'Swimming Pool'];

const TABS = [
  {
    id: 'basic',
    title: 'Basic Info',
    description: 'Property name, type & owner',
    icon: Building2,
    required: true
  },
  {
    id: 'address',
    title: 'Address',
    description: 'Location details',
    icon: MapPin,
    required: true
  },
  {
    id: 'details',
    title: 'Property Details',
    description: 'Area, floors & amenities',
    icon: Home,
    required: true
  },
  {
    id: 'owner',
    title: 'Owner Contact',
    description: 'Contact information',
    icon: User,
    required: true
  },
  {
    id: 'amenities',
    title: 'Enhanced Amenities',
    description: 'Additional features',
    icon: Star,
    required: false
  },
  {
    id: 'files',
    title: 'Photos & Documents',
    description: 'Photos & documents',
    icon: Upload,
    required: false
  },
  {
    id: 'receipt',
    title: 'Receipt Template',
    description: 'Payment configuration',
    icon: FileText,
    required: false
  }
];

const PropertyFormTabbed: React.FC<PropertyFormTabbedProps> = ({
  initialData,
  onSubmit,
  loading,
  isEdit = false,
  propertyName,
  propertyId,
  apiError
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { data: owner, loading: ownerLoading } = useUser(
    initialData?.ownerId && initialData.ownerId.trim()
      ? initialData.ownerId
      : (!isEdit ? currentUser?.id || '' : null)
  );
  const { data: users, loading: usersLoading, error: usersError } = useUsers();

  // Debug logging
  React.useEffect(() => {
  }, [currentUser, users, usersLoading, usersError]);

  const [activeTab, setActiveTab] = useState('basic');
  const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set());

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

  // Handle API validation errors
  React.useEffect(() => {
    if (apiError) {
      if (apiError.details) {
        // Field-specific validation errors
        const fieldErrors: Record<string, string> = {};
        Object.entries(apiError.details).forEach(([field, message]) => {
          // Handle nested address fields
          if (field.startsWith('address.')) {
            const addressField = field.split('.')[1];
            fieldErrors[addressField] = message as string;
          } else {
            fieldErrors[field] = message as string;
          }
        });
        setErrors(fieldErrors);

        // Focus on the first invalid field and switch to its tab
        const firstInvalidField = Object.keys(fieldErrors)[0];
        if (firstInvalidField) {
          const targetTab = getTabForField(firstInvalidField);
          if (targetTab) {
            setActiveTab(targetTab);
          }
          setTimeout(() => {
            const element = document.getElementById(firstInvalidField) ||
                          document.querySelector(`[name="${firstInvalidField}"]`) as HTMLElement;
            if (element) {
              element.focus();
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        }
      } else {
        // Generic error - show in submit error
        setErrors({ submit: apiError.message });
      }
    }
  }, [apiError]);

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
      country: initialData?.address?.country || 'India',
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
    ownerId: initialData?.ownerId || (!isEdit ? currentUser?.id || '0935d25e-60ed-4f76-aef5-bc51d52b9599' : ''),
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
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      buildingAmenities: prev.buildingAmenities?.includes(amenity)
        ? prev.buildingAmenities.filter(a => a !== amenity)
        : [...(prev.buildingAmenities || []), amenity]
    }));
  };

  const getTabForField = (fieldName: string): string | null => {
    const fieldTabMap: Record<string, string> = {
      name: 'basic',
      propertyType: 'basic',
      status: 'basic',
      currency: 'basic',
      ownerId: 'basic',
      street: 'address',
      city: 'address',
      state: 'address',
      pincode: 'address',
      country: 'address',
      landmark: 'address',
      totalArea: 'details',
      totalFloors: 'details',
      yearBuilt: 'details',
      parkingSpaces: 'details',
      ownerMobile: 'owner',
      ownerEmail: 'owner'
    };
    return fieldTabMap[fieldName] || null;
  };

  const validateTab = (tabId: string): boolean => {
    const newErrors: Record<string, string> = {};

    switch (tabId) {
      case 'basic':
        if (!formData.name || formData.name.trim().length === 0) newErrors.name = 'Property name is required';
        if (!isEdit && !formData.ownerId) newErrors.ownerId = 'Owner selection is required';
        break;
      case 'address':
        if (!formData.address.street || formData.address.street.trim().length === 0) newErrors.street = 'Street address is required';
        if (!formData.address.city || formData.address.city.trim().length === 0) newErrors.city = 'City is required';
        if (!formData.address.state || formData.address.state.trim().length === 0) newErrors.state = 'State is required';
        if (!formData.address.pincode || formData.address.pincode.trim().length === 0) newErrors.pincode = 'Pincode is required';
        break;
      case 'details':
        if (!formData.totalArea || formData.totalArea <= 0) newErrors.totalArea = 'Valid area is required';
        break;
      case 'owner':
        if (!isEdit && !formData.ownerDetails.mobileNumbers[0] || (formData.ownerDetails.mobileNumbers[0] && formData.ownerDetails.mobileNumbers[0].trim().length === 0)) newErrors.ownerMobile = 'At least one mobile number is required';
        if (!isEdit && !formData.ownerDetails.emailIds[0] || (formData.ownerDetails.emailIds[0] && formData.ownerDetails.emailIds[0].trim().length === 0)) newErrors.ownerEmail = 'At least one email ID is required';
        break;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length === 0) newErrors.name = 'Property name is required';
    if (!formData.address.street || formData.address.street.trim().length === 0) newErrors.street = 'Street address is required';
    if (!formData.address.city || formData.address.city.trim().length === 0) newErrors.city = 'City is required';
    if (!formData.address.state || formData.address.state.trim().length === 0) newErrors.state = 'State is required';
    if (!formData.address.pincode || formData.address.pincode.trim().length === 0) newErrors.pincode = 'Pincode is required';
    if (!formData.totalArea || formData.totalArea <= 0) newErrors.totalArea = 'Valid area is required';
    if (!isEdit && !formData.ownerId) newErrors.ownerId = 'Owner selection is required';
    if (!isEdit && !formData.ownerDetails.mobileNumbers[0] || (formData.ownerDetails.mobileNumbers[0] && formData.ownerDetails.mobileNumbers[0].trim().length === 0)) newErrors.ownerMobile = 'At least one mobile number is required';
    if (!isEdit && !formData.ownerDetails.emailIds[0] || (formData.ownerDetails.emailIds[0] && formData.ownerDetails.emailIds[0].trim().length === 0)) newErrors.ownerEmail = 'At least one email ID is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTabChange = (tabId: string) => {
    // In edit mode, allow free navigation without validation
    if (isEdit) {
      setActiveTab(tabId);
    } else {
      // In create mode, validate current tab before allowing navigation
      if (validateTab(activeTab)) {
        setCompletedTabs(prev => new Set([...prev, activeTab]));
        setActiveTab(tabId);
      }
    }
  };

  const handleNext = () => {
    if (validateTab(activeTab)) {
      setCompletedTabs(prev => new Set([...prev, activeTab]));
      const currentIndex = TABS.findIndex(tab => tab.id === activeTab);
      if (currentIndex < TABS.length - 1) {
        setActiveTab(TABS[currentIndex + 1].id);
      }
    }
  };

  const handlePrevious = () => {
    const currentIndex = TABS.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(TABS[currentIndex - 1].id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      // Find first tab with errors
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const targetTab = getTabForField(firstErrorField);
        if (targetTab) {
          setActiveTab(targetTab);
        }
      }
      return;
    }

    await onSubmit(formData);
  };

  const handleCancel = () => {
    if (isEdit && propertyId) {
      // In edit mode, go back to property detail/dashboard
      navigateBackOrFallback(navigate, `/properties/${propertyId}/dashboard`);
    } else {
      navigateBackOrFallback(navigate, '/properties');
    }
  };



  const hasTabData = (tabId: string): boolean => {
    switch (tabId) {
      case 'basic':
        return !!(formData.name || formData.description || formData.propertyType || formData.status || formData.ownerId);
      case 'address':
        return !!(formData.address?.street || formData.address?.city || formData.address?.state || formData.address?.pincode);
      case 'details':
        return !!(formData.totalArea || formData.totalFloors || formData.yearBuilt || formData.parkingSpaces || (formData.buildingAmenities && formData.buildingAmenities.length > 0));
      case 'owner':
        return !!(formData.ownerDetails?.name || (formData.ownerDetails?.mobileNumbers && formData.ownerDetails.mobileNumbers.some(m => m)) || (formData.ownerDetails?.emailIds && formData.ownerDetails.emailIds.some(e => e)));
      case 'amenities':
        return !!((formData.amenities?.basic && formData.amenities.basic.length > 0) || (formData.amenities?.luxury && formData.amenities.luxury.length > 0));
      case 'files':
        return !!((formData.buildingPhotos && formData.buildingPhotos.length > 0) || (formData.files && formData.files.length > 0));
      case 'receipt':
        return !!(formData.receiptTemplate?.bankDetails?.bankName || formData.receiptTemplate?.bankDetails?.accountNumber);
      default:
        return false;
    }
  };
  return (
    <GenericTabbedForm
      title={isEdit ? `Edit ${propertyName || 'Property'}` : "Create Property"}
      subtitle={isEdit ? "Update property information" : "Fill in the details to create a new property"}
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      completedTabs={completedTabs}
      isEdit={isEdit}
      loading={loading}
      hasTabData={isEdit ? hasTabData : undefined}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitLabel={isEdit ? "Save Changes" : "Create Property"}
    >
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsContent value="basic" className="p-6">
          <FormGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" gap="lg">
            <FormColumn
              title="Basic Information"
              description="Essential property details"
              icon={<Building2 className="h-5 w-5" />}
              className="xl:col-span-2"
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
            </FormColumn>

            <FormColumn
              title="Property Status"
              description="Current status and currency"
              icon={<CheckCircle className="h-5 w-5" />}
            >
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
            </FormColumn>

            <FormColumn
              title="Ownership & Description"
              description="Owner and additional details"
              icon={<User className="h-5 w-5" />}
              className="xl:col-span-2"
            >
              <FormField label="Owner Name" required>
                <Select
                  value={formData.ownerId || ''}
                  onValueChange={(value) => {
                    const selectedUser = users?.find(u => u.id === value);
                    handleChange('ownerId', value);
                    if (selectedUser) {
                      handleChange('ownerDetails', {
                        ...formData.ownerDetails,
                        name: selectedUser.name || selectedUser.username || ''
                      });
                    }
                  }}
                  disabled={usersLoading}
                >
                  <SelectTrigger error={errors.ownerId} className="h-10">
                    <SelectValue placeholder={usersLoading ? "Loading owners..." : "Select owner"} />
                  </SelectTrigger>
                  <SelectContent>
                    {users && users.length > 0 && users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.username || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          </FormGrid>
        </TabsContent>

        <TabsContent value="address" className="p-6">
          <FormGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" gap="lg">
            <FormColumn
              title="Street & City"
              description="Primary address details"
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
            </FormColumn>

            <FormColumn
              title="State & Pincode"
              description="Location identifiers"
              icon={<MapPin className="h-5 w-5" />}
            >
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
            </FormColumn>

            <FormColumn
              title="Country & Landmark"
              description="Additional location details"
              icon={<MapPin className="h-5 w-5" />}
            >
              <FormField label="Country">
                <Input
                  id="country"
                  value={formData.address.country}
                  onChange={(e) => handleAddressChange('country', e.target.value)}
                  placeholder="Enter country"
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
          </FormGrid>
        </TabsContent>

        <TabsContent value="details" className="p-6">
          <FormGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" gap="lg">
            <FormColumn
              title="Area & Floors"
              description="Physical property specifications"
              icon={<Home className="h-5 w-5" />}
            >
              <FormField label="Total Area (sq ft)" required>
                <Input
                  id="totalArea"
                  type="number"
                  value={formData.totalArea || ''}
                  onChange={(e) => handleChange('totalArea', parseFloat(e.target.value) || 0)}
                  error={errors.totalArea}
                  placeholder="Enter total area"
                  className="h-10"
                />
              </FormField>

              <FormField label="Total Floors">
                <Input
                  id="totalFloors"
                  type="number"
                  value={formData.totalFloors || ''}
                  onChange={(e) => handleChange('totalFloors', parseInt(e.target.value) || undefined)}
                  placeholder="Enter total floors"
                  className="h-10"
                />
              </FormField>
            </FormColumn>

            <FormColumn
              title="Construction & Parking"
              description="Building details"
              icon={<Home className="h-5 w-5" />}
            >
              <FormField label="Year Built">
                <Input
                  id="yearBuilt"
                  type="number"
                  value={formData.yearBuilt || ''}
                  onChange={(e) => handleChange('yearBuilt', parseInt(e.target.value) || undefined)}
                  placeholder="Enter year built"
                  className="h-10"
                />
              </FormField>

              <FormField label="Parking Spaces">
                <Input
                  id="parkingSpaces"
                  type="number"
                  value={formData.parkingSpaces || ''}
                  onChange={(e) => handleChange('parkingSpaces', parseInt(e.target.value) || undefined)}
                  placeholder="Enter parking spaces"
                  className="h-10"
                />
              </FormField>
            </FormColumn>

            <FormColumn
              title="Building Amenities"
              description="Available facilities"
              icon={<Home className="h-5 w-5" />}
              className="xl:col-span-2"
            >
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
          </FormGrid>
        </TabsContent>

        <TabsContent value="owner" className="p-6">
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
        </TabsContent>

        <TabsContent value="amenities" className="p-6">
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
        </TabsContent>

        <TabsContent value="files" className="p-6">
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
        </TabsContent>

        <TabsContent value="receipt" className="p-6">
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
        </TabsContent>
      </Tabs>
    </GenericTabbedForm>
  );
};

export default PropertyFormTabbed;
