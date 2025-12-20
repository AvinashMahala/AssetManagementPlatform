import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import navigateBackOrFallback from '@/utils/navigation';
import { Home, DollarSign, Star, CheckCircle, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { Button } from '@/componentDesignLibrary';
import { Input } from '@/componentDesignLibrary';
import { Textarea } from '@/componentDesignLibrary';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/componentDesignLibrary';
import { Badge } from '@/componentDesignLibrary';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/componentDesignLibrary';
import { useProperties, useProperty } from '@/hooks';
import type { UnitInput } from '@/types/unit';
import { UnitStatus, UnitType } from '@/types/unit';

interface UnitFormTabbedProps {
  initialData?: Partial<UnitInput>;
  onSubmit: (data: UnitInput) => Promise<void>;
  loading?: boolean;
  isEdit?: boolean;
  unitId?: string;
}

const COMMON_AMENITIES = [
  'WiFi', 'AC', 'TV', 'Washing Machine', 'Microwave',
  'Fridge', 'Water Heater', 'Balcony', 'Parking', 'Security'
];

const TABS = [
  { id: 'basic', label: 'Basic & Specs', icon: Home, description: 'Property, unit details, and specifications' },
  { id: 'financial', label: 'Financial Details', icon: DollarSign, description: 'Rent, deposits, and charges' },
  { id: 'amenities', label: 'Amenities', icon: Star, description: 'Features and description' }
];

const UnitFormTabbed: React.FC<UnitFormTabbedProps> = ({
  initialData,
  onSubmit,
  loading,
  isEdit = false,
  unitId
}) => {
  const navigate = useNavigate();
  const { properties: availableProperties, loading: propertiesLoading } = useProperties();
  const { data: selectedProperty } = useProperty(initialData?.propertyId || '');

  const [currentTab, setCurrentTab] = useState('basic');
  const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<UnitInput>({
    propertyId: initialData?.propertyId || '',
    unitNumber: initialData?.unitNumber || '',
    unitName: initialData?.unitName || '',
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

  // Auto-generate unit name when relevant fields change
  useEffect(() => {
    if (formData.unitNumber && formData.unitType && !initialData?.unitName) {
      const parts = [];

      // Add bedroom info for residential units
      if ((formData.unitType === UnitType.APARTMENT || formData.unitType === UnitType.HOUSE || formData.unitType === UnitType.VILLA || formData.unitType === UnitType.STUDIO) && formData.bedrooms) {
        if (formData.unitType === UnitType.STUDIO) {
          parts.push('Studio');
        } else {
          parts.push(`${formData.bedrooms}BHK`);
        }
      }

      // Add unit type
      const unitTypeLabel = formData.unitType.charAt(0).toUpperCase() + formData.unitType.slice(1);
      parts.push(unitTypeLabel);

      // Add floor info if not ground floor
      if (formData.floor && formData.floor > 0) {
        parts.push(`Floor ${formData.floor}`);
      }

      // Add furnished status
      if (formData.furnished) {
        parts.push('(Furnished)');
      }

      // Add property context if available
      if (selectedProperty?.name) {
        parts.push(`in ${selectedProperty.name}`);
      }

      const generatedName = parts.join(' ');
      // Only update if the generated name is different and not empty
      if (generatedName && generatedName !== formData.unitName) {
        setFormData(prev => ({ ...prev, unitName: generatedName }));
      }
    }
  }, [
    formData.unitNumber,
    formData.unitType,
    formData.bedrooms,
    formData.floor,
    formData.furnished,
    selectedProperty?.name,
    initialData?.unitName
  ]);

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

  const validateTab = (tabId: string): boolean => {
    const newErrors: Record<string, string> = {};

    switch (tabId) {
      case 'basic':
        if (!formData.propertyId && !initialData?.propertyId) newErrors.propertyId = 'Property is required';
        if (!formData.unitNumber.trim()) newErrors.unitNumber = 'Unit number is required';
        if (formData.area <= 0) newErrors.area = 'Area must be greater than 0';
        if (formData.bedrooms && formData.bedrooms < 0) newErrors.bedrooms = 'Bedrooms cannot be negative';
        if (formData.bathrooms && formData.bathrooms < 0) newErrors.bathrooms = 'Bathrooms cannot be negative';
        break;
      case 'financial':
        if (formData.monthlyRent < 0) newErrors.monthlyRent = 'Monthly rent cannot be negative';
        if (formData.securityDeposit < 0) newErrors.securityDeposit = 'Security deposit cannot be negative';
        break;
      case 'amenities':
        // No validation required for amenities tab
        break;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const hasTabData = (tabId: string): boolean => {
    switch (tabId) {
      case 'basic':
        return !!(formData.propertyId || formData.unitNumber || formData.floor || formData.unitType || formData.status || formData.area || formData.bedrooms || formData.bathrooms || formData.balconies);
      case 'financial':
        return !!(formData.monthlyRent || formData.securityDeposit || formData.maintenanceCharges);
      case 'amenities':
        return !!((formData.unitAmenities && formData.unitAmenities.length > 0) || formData.description || (formData.unitPhotos && formData.unitPhotos.length > 0));
      default:
        return false;
    }
  };

  const handleTabChange = (tabId: string) => {
    // In edit mode, allow free navigation without validation
    if (isEdit) {
      setCurrentTab(tabId);
    } else {
      // In create mode, validate current tab before allowing navigation
      if (validateTab(currentTab)) {
        setCompletedTabs(prev => new Set([...prev, currentTab]));
        setCurrentTab(tabId);
      }
    }
  };

  const handleNext = () => {
    if (validateTab(currentTab)) {
      setCompletedTabs(prev => new Set([...prev, currentTab]));
      const currentIndex = TABS.findIndex(tab => tab.id === currentTab);
      if (currentIndex < TABS.length - 1) {
        setCurrentTab(TABS[currentIndex + 1].id);
      }
    }
  };

  const handlePrevious = () => {
    const currentIndex = TABS.findIndex(tab => tab.id === currentTab);
    if (currentIndex > 0) {
      setCurrentTab(TABS[currentIndex - 1].id);
    }
  };

  const validateAllTabs = (): boolean => {
    let allValid = true;
    TABS.forEach(tab => {
      if (!validateTab(tab.id)) {
        allValid = false;
      }
    });
    return allValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAllTabs()) {
      // Find first tab with errors
      const firstErrorTab = TABS.find(tab => !validateTab(tab.id));
      if (firstErrorTab) {
        setCurrentTab(firstErrorTab.id);
      }
      return;
    }

    await onSubmit(formData);
  };

  const handleCancel = () => {
    if (isEdit && unitId) {
      navigateBackOrFallback(navigate, `/units/${unitId}`);
    } else {
      navigateBackOrFallback(navigate, '/units');
    }
  };

  const currentTabIndex = TABS.findIndex(tab => tab.id === currentTab);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === TABS.length - 1;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEdit ? 'Edit Unit' : 'Create Unit - Guided Setup'}
        </h1>
        <p className="text-gray-600">
          {isEdit ? 'Update unit information across different sections.' : 'Complete each section to create your unit step by step.'}
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {TABS.map((tab, index) => {
            const isCompleted = completedTabs.has(tab.id);
            const isCurrent = tab.id === currentTab;
            const hasData = isEdit ? hasTabData(tab.id) : isCompleted;
            const Icon = tab.icon;

            return (
              <React.Fragment key={tab.id}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 relative ${
                    hasData ? 'bg-green-500 border-green-500 text-white' :
                    isCurrent ? 'bg-blue-500 border-blue-500 text-white' :
                    'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    {hasData ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    {isEdit && hasData && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <span className={`text-sm mt-2 font-medium ${
                    isCurrent ? 'text-blue-600' : hasData ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {tab.label}
                  </span>
                  <span className="text-xs text-gray-500 mt-1 text-center max-w-24">
                    {tab.description}
                  </span>
                </div>
                {index < TABS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 mt-5 ${
                    hasData ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isCompleted = completedTabs.has(tab.id);
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={`flex items-center space-x-2 ${
                    isCompleted ? 'text-green-600' : ''
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {isCompleted && <CheckCircle className="w-3 h-3 text-green-500" />}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Basic & Specs Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Home className="w-5 h-5" />
                  <span>Basic Information & Specifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property <span className="text-red-500">*</span>
                    </label>
                    {initialData?.propertyId ? (
                      <div className="space-y-2">
                        <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                          <span className="text-sm text-gray-900">
                            {selectedProperty?.name || (initialData?.propertyId ? `Loading property ${initialData.propertyId}...` : 'No property selected')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Property is pre-selected from the current context
                        </p>
                      </div>
                    ) : (
                      <Select
                        value={formData.propertyId}
                        onValueChange={(value) => handleChange('propertyId', value)}
                        disabled={propertiesLoading}
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
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.unitNumber}
                      onChange={(e) => handleChange('unitNumber', e.target.value)}
                      error={errors.unitNumber}
                      placeholder="e.g., 101, A-201"
                      className="h-10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Name
                    </label>
                    <Input
                      value={formData.unitName}
                      onChange={(e) => handleChange('unitName', e.target.value)}
                      placeholder="e.g., 2BHK Apartment Floor 5 (Furnished)"
                      className="h-10"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-generated based on your selections, but you can edit it
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Floor
                    </label>
                    <Input
                      type="number"
                      value={formData.floor}
                      onChange={(e) => handleChange('floor', Number(e.target.value))}
                      placeholder="Ground floor = 0"
                      className="h-10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Type <span className="text-red-500">*</span>
                    </label>
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area (sq ft) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={formData.area}
                      onChange={(e) => handleChange('area', Number(e.target.value))}
                      error={errors.area}
                      min="0"
                      className="h-10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bedrooms <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => handleChange('bedrooms', Number(e.target.value))}
                      error={errors.bedrooms}
                      min="0"
                      className="h-10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bathrooms <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => handleChange('bathrooms', Number(e.target.value))}
                      error={errors.bathrooms}
                      min="0"
                      className="h-10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Balconies
                    </label>
                    <Input
                      type="number"
                      value={formData.balconies}
                      onChange={(e) => handleChange('balconies', Number(e.target.value))}
                      min="0"
                      className="h-10"
                    />
                  </div>

                  <div className="flex items-center space-x-2 md:col-span-2">
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Details Tab */}
          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Financial Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Rent (₹) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={formData.monthlyRent}
                      onChange={(e) => handleChange('monthlyRent', Number(e.target.value))}
                      error={errors.monthlyRent}
                      min="0"
                      className="h-10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Security Deposit (₹) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={formData.securityDeposit}
                      onChange={(e) => handleChange('securityDeposit', Number(e.target.value))}
                      error={errors.securityDeposit}
                      min="0"
                      className="h-10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maintenance Charges (₹)
                    </label>
                    <Input
                      type="number"
                      value={formData.maintenanceCharges}
                      onChange={(e) => handleChange('maintenanceCharges', Number(e.target.value))}
                      min="0"
                      className="h-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Amenities Tab */}
          <TabsContent value="amenities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>Amenities & Description</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Enter unit description..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Amenities
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {COMMON_AMENITIES.map(amenity => (
                      <Badge
                        key={amenity}
                        variant={formData.unitAmenities?.includes(amenity) ? 'default' : 'outline'}
                        className="cursor-pointer hover:bg-primary/80 transition-colors justify-center py-2 px-3 text-sm h-auto"
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Fixed Footer Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>

              {!isFirstTab && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>
              )}
            </div>

            <div className="flex space-x-4">
              {/* Navigation buttons for edit mode */}
              {isEdit && !isFirstTab && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>
              )}

              {/* Next button for create mode */}
              {!isLastTab && !isEdit ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Unit')}</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Add padding to account for fixed footer */}
        <div className="h-20" />
      </form>
    </div>
  );
};

export default UnitFormTabbed;