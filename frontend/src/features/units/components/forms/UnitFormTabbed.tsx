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
import { useProperties, useProperty } from '@/features/properties/hooks/useProperties';
import { useAuth } from '@/features/auth/hooks/useUsers';
import { useRBACContext } from '@/contexts/RBACContext';
import type { UnitInput } from '@/features/units/types';
import { UnitStatus, UnitType } from '@/features/units/types';

interface UnitFormTabbedProps {
  initialData?: Partial<UnitInput>;
  onSubmit: (data: UnitInput, options?: { audit?: boolean }) => Promise<void>;
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
  // Guard to prevent navigation click from triggering an immediate submit when UI swaps the Next button to Submit
  const [navDisabled, setNavDisabled] = useState(false);

  // Use a permissive form state so we can allow empty strings while editing number fields
  const [formData, setFormData] = useState<any>({
    propertyId: initialData?.propertyId || '',
    unitNumber: initialData?.unitNumber || '',
    // Unit name will be auto-generated and placed at the end of the form
    unitName: initialData?.unitName || '',
    floor: initialData?.floor || 0,
    unitType: initialData?.unitType || UnitType.APARTMENT,
    status: initialData?.status || UnitStatus.AVAILABLE,
    area: initialData?.area || 0,
    bedrooms: initialData?.bedrooms || 2,
    bathrooms: initialData?.bathrooms || 2,
    balconies: initialData?.balconies || 1,
    furnished: initialData?.furnished || false,
    // Treat money inputs as strings while editing to avoid the '0' being prepended issue
    monthlyRent: initialData?.monthlyRent ?? '',
    securityDeposit: initialData?.securityDeposit ?? 0,
    maintenanceCharges: initialData?.maintenanceCharges ?? '',
    unitAmenities: initialData?.unitAmenities || [],
    unitPhotos: initialData?.unitPhotos || [],
    description: initialData?.description || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user: currentUser } = useAuth();
  const { roles } = useRBACContext();
  const [auditChecked, setAuditChecked] = useState(false);

  const isAdmin = !!(
    roles?.some(r => String(r || '').toLowerCase() === 'admin') ||
    String(currentUser?.role || '').toLowerCase() === 'admin'
  );

  // Debug: log current user and roles to help diagnose visibility of admin-only features
  useEffect(() => {
    try {
      // Use console.info so it's easier to filter in browser console
      console.info('[UnitFormTabbed] currentUser:', currentUser);
      console.info('[UnitFormTabbed] rbac roles:', roles);
      console.info('[UnitFormTabbed] isAdmin:', isAdmin);
    } catch (e) {
      // Swallow any logging errors
    }
  }, [currentUser, roles, isAdmin]);

  // Track if the user manually edited the unit name so we don't auto-overwrite it
  const [unitNameEdited, setUnitNameEdited] = useState(false);

  // Auto-generate unit name in the format: <UnitType> - <Unit Number> - <2BHK|Studio>
  useEffect(() => {
    if (!unitNameEdited && !initialData?.unitName && formData.unitType && formData.unitNumber) {
      const unitTypeLabel = formData.unitType.charAt(0).toUpperCase() + formData.unitType.slice(1);
      let bedroomPart = '';

      if (formData.unitType === UnitType.STUDIO) {
        bedroomPart = 'Studio';
      } else if (formData.bedrooms) {
        bedroomPart = `${formData.bedrooms}BHK`;
      }

      const generatedName = [unitTypeLabel, formData.unitNumber, bedroomPart].filter(Boolean).join(' - ');

      if (generatedName && generatedName !== formData.unitName) {
        setFormData(prev => ({ ...prev, unitName: generatedName }));
      }
    }
  }, [formData.unitNumber, formData.unitType, formData.bedrooms, unitNameEdited, initialData?.unitName]);

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
        // Monthly rent is required and must be greater than 0
        if (!formData.monthlyRent || Number(formData.monthlyRent) <= 0) newErrors.monthlyRent = 'Monthly rent is required and must be greater than 0';
        // Security deposit and maintenance charges are optional but cannot be negative
        if (formData.securityDeposit !== undefined && formData.securityDeposit !== '' && Number(formData.securityDeposit) < 0) newErrors.securityDeposit = 'Security deposit cannot be negative';
        if (formData.maintenanceCharges !== undefined && formData.maintenanceCharges !== '' && Number(formData.maintenanceCharges) < 0) newErrors.maintenanceCharges = 'Maintenance charges cannot be negative';
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
    if (navDisabled) return;

    // Prevent rapid double-click or DOM swap causing submit to be inadvertently triggered
    setNavDisabled(true);

    if (validateTab(currentTab)) {
      setCompletedTabs(prev => new Set([...prev, currentTab]));
      const currentIndex = TABS.findIndex(tab => tab.id === currentTab);
      if (currentIndex < TABS.length - 1) {
        setCurrentTab(TABS[currentIndex + 1].id);
      }
    }

    // Re-enable after the render cycle -- small timeout is sufficient
    setTimeout(() => setNavDisabled(false), 250);
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

    // Normalize numeric fields before submitting
    const payload: UnitInput = {
      ...formData,
      monthlyRent: Number(formData.monthlyRent),
      securityDeposit: Number(formData.securityDeposit) || 0,
      maintenanceCharges: formData.maintenanceCharges === '' || formData.maintenanceCharges === undefined ? undefined : Number(formData.maintenanceCharges),
      area: Number(formData.area),
      floor: formData.floor !== undefined && formData.floor !== '' ? Number(formData.floor) : undefined,
      bedrooms: formData.bedrooms !== undefined && formData.bedrooms !== '' ? Number(formData.bedrooms) : undefined,
      bathrooms: formData.bathrooms !== undefined && formData.bathrooms !== '' ? Number(formData.bathrooms) : undefined,
      balconies: formData.balconies !== undefined && formData.balconies !== '' ? Number(formData.balconies) : undefined,
    };

    try {
      await onSubmit(payload, { audit: auditChecked });
    } catch (err: any) {
      console.error('Submit failed:', err);
      const msg = err?.message || 'Failed to save unit. Please try again.';
      setErrors(prev => ({ ...prev, submit: msg }));
    }
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
        {isAdmin && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setAuditChecked(prev => !prev)}
              className="text-sm text-blue-600 hover:underline"
              aria-pressed={auditChecked}
            >
              {auditChecked ? 'Audit: ON (admin)' : 'Audit: OFF (admin)'}
            </button>
          </div>
        )}
      </div>

      {errors.submit && (
        <div role="alert" className="p-4 mb-4 rounded bg-red-50 text-red-700">
          {errors.submit}
        </div>
      )}

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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Name
                    </label>
                    <Input
                      value={formData.unitName}
                      onChange={(e) => { setUnitNameEdited(true); handleChange('unitName', e.target.value); }}
                      placeholder="Auto-generated: Apartment - 101 - 2BHK"
                      className="h-10"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-generated as "&lt;UnitType&gt; - &lt;Unit Number&gt; - &lt;2BHK&gt;" but you can edit it.
                    </p>
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
                      onChange={(e) => handleChange('monthlyRent', e.target.value)}
                      onFocus={() => { if (formData.monthlyRent === 0) handleChange('monthlyRent', ''); }}
                      error={errors.monthlyRent}
                      min="0"
                      className="h-10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Security Deposit (₹)
                    </label>
                    <Input
                      type="number"
                      value={formData.securityDeposit}
                      onChange={(e) => handleChange('securityDeposit', e.target.value)}
                      onFocus={() => { if (formData.securityDeposit === 0) handleChange('securityDeposit', ''); }}
                      onBlur={() => { if (formData.securityDeposit === '') handleChange('securityDeposit', 0); }}
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
                      onChange={(e) => handleChange('maintenanceCharges', e.target.value)}
                      onFocus={() => { if (formData.maintenanceCharges === 0) handleChange('maintenanceCharges', ''); }}
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

            <div className="flex-1 flex items-center justify-center">
              {isAdmin && (
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={auditChecked} onChange={(e) => setAuditChecked(e.target.checked)} className="rounded" />
                  <span className="text-sm">Run data audit for this operation</span>
                </label>
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
                  disabled={loading || navDisabled}
                  className="flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading || navDisabled}
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