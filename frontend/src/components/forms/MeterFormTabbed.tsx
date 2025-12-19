import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import navigateBackOrFallback from '../../utils/navigation';
import { Zap, DollarSign, Settings, CheckCircle, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { Button } from '@/componentDesignLibrary';
import { Input } from '@/componentDesignLibrary';
import { Textarea } from '@/componentDesignLibrary';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/componentDesignLibrary';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/componentDesignLibrary';
import { useProperties, useUnits, useProperty, useUnit } from '../../hooks';
import { MeterType } from '../../types/meter';
import type { MeterInput } from '../../types/meter';
import { generateMeterName } from '../../utils/helpers';

interface MeterFormTabbedProps {
  initialData?: Partial<MeterInput>;
  onSubmit: (data: MeterInput) => Promise<void>;
  loading?: boolean;
  isEdit?: boolean;
}

const TABS = [
  { id: 'basic', label: 'Basic Info', icon: Zap, description: 'Property, unit, and meter details' },
  { id: 'pricing', label: 'Pricing', icon: DollarSign, description: 'Cost configuration' },
  { id: 'settings', label: 'Settings', icon: Settings, description: 'Additional configuration' }
];

const MeterFormTabbed: React.FC<MeterFormTabbedProps> = ({
  initialData,
  onSubmit,
  loading,
  isEdit = false
}) => {
  const navigate = useNavigate();
  const { properties: availableProperties, loading: propertiesLoading } = useProperties();
  const { units: allUnits, loading: unitsLoading } = useUnits();
  const { data: selectedProperty } = useProperty(initialData?.propertyId || '');
  const { data: selectedUnit } = useUnit(initialData?.unitId || '');

  const [currentTab, setCurrentTab] = useState('basic');
  const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<MeterInput>({
    propertyId: initialData?.propertyId || '',
    unitId: initialData?.unitId || '',
    meterType: initialData?.meterType || MeterType.ELECTRICITY,
    meterName: initialData?.meterName || '',
    meterNumber: initialData?.meterNumber || '',
    costPerUnit: initialData?.costPerUnit || 0,
    fixedCharge: initialData?.fixedCharge || 0,
    remarks: initialData?.remarks || '',
    isActive: initialData?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter units based on selected property
  const availableUnits = allUnits?.filter(unit => unit.propertyId === formData.propertyId) || [];

  // Auto-generate meter name when property, unit, and meter type are available
  useEffect(() => {
    if (formData.propertyId && formData.unitId && formData.meterType && !initialData?.meterName) {
      const selectedProperty = availableProperties.find(p => p.id === formData.propertyId);
      const currentAvailableUnits = allUnits?.filter(unit => unit.propertyId === formData.propertyId) || [];
      const selectedUnit = currentAvailableUnits.find(u => u.id === formData.unitId);

      if (selectedProperty && selectedUnit) {
        const generatedName = generateMeterName(
          selectedProperty.name,
          selectedUnit.unitNumber,
          formData.meterType
        );
        // Only update if the generated name is different from current name
        if (generatedName !== formData.meterName) {
          setFormData(prev => ({ ...prev, meterName: generatedName }));
        }
      }
    }
  }, [formData.propertyId, formData.unitId, formData.meterType, availableProperties, allUnits, initialData?.meterName]);

  const handleChange = (field: keyof MeterInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Reset unit selection when property changes
    if (field === 'propertyId') {
      setFormData(prev => ({ ...prev, unitId: '' }));
    }
  };

  const validateTab = (tabId: string): boolean => {
    const newErrors: Record<string, string> = {};

    switch (tabId) {
      case 'basic':
        if (!formData.propertyId && !initialData?.propertyId) newErrors.propertyId = 'Property is required';
        if (!formData.unitId && !initialData?.unitId) newErrors.unitId = 'Unit is required';
        if (!formData.meterName.trim()) newErrors.meterName = 'Meter name is required';
        if (!formData.meterType) newErrors.meterType = 'Meter type is required';
        break;
      case 'pricing':
        if (formData.costPerUnit <= 0) newErrors.costPerUnit = 'Cost per unit must be greater than 0';
        break;
      case 'settings':
        // No validation required for settings tab
        break;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const hasTabData = (tabId: string): boolean => {
    switch (tabId) {
      case 'basic':
        return !!(formData.propertyId || formData.unitId || formData.meterType || formData.meterName || formData.meterNumber);
      case 'pricing':
        return !!(formData.costPerUnit || formData.fixedCharge);
      case 'settings':
        return !!(formData.remarks);
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
    navigateBackOrFallback(navigate, '/meters');
  };

  const currentTabIndex = TABS.findIndex(tab => tab.id === currentTab);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === TABS.length - 1;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEdit ? 'Edit Meter' : 'Create Meter - Guided Setup'}
        </h1>
        <p className="text-gray-600">
          {isEdit ? 'Update meter information across different sections.' : 'Complete each section to configure your meter step by step.'}
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
                    isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
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

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Basic Information</span>
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
                      Unit <span className="text-red-500">*</span>
                    </label>
                    {initialData?.unitId ? (
                      <div className="space-y-2">
                        <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                          <span className="text-sm text-gray-900">
                            {selectedUnit ? `${selectedUnit.unitNumber} - ${selectedUnit.unitName || 'Unnamed Unit'}` : (initialData?.unitId ? `Loading unit ${initialData.unitId}...` : 'No unit selected')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Unit is pre-selected from the current context
                        </p>
                      </div>
                    ) : (
                      <Select
                        value={formData.unitId}
                        onValueChange={(value) => handleChange('unitId', value)}
                        disabled={!formData.propertyId || unitsLoading}
                      >
                        <SelectTrigger error={errors.unitId} className="h-10">
                          <SelectValue
                            placeholder={
                              !formData.propertyId
                                ? "Select a property first"
                                : unitsLoading
                                ? "Loading units..."
                                : "Select a unit"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUnits.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.unitNumber} - {unit.unitName || 'Unnamed Unit'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meter Type <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.meterType}
                      onValueChange={(value) => handleChange('meterType', value as MeterType)}
                    >
                      <SelectTrigger error={errors.meterType} className="h-10">
                        <SelectValue placeholder="Select meter type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(MeterType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meter Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Main Electricity Meter, Kitchen Water Meter"
                      value={formData.meterName}
                      onChange={(e) => handleChange('meterName', e.target.value)}
                      className="h-10"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meter Number
                    </label>
                    <Input
                      type="text"
                      placeholder="Serial number or meter ID"
                      value={formData.meterNumber}
                      onChange={(e) => handleChange('meterNumber', e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Pricing Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost per Unit (₹) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={formData.costPerUnit || ''}
                      onChange={(e) => handleChange('costPerUnit', parseFloat(e.target.value) || 0)}
                      className="h-10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Fixed Charge (₹)
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={formData.fixedCharge || ''}
                      onChange={(e) => handleChange('fixedCharge', parseFloat(e.target.value) || 0)}
                      className="h-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Additional Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <Textarea
                    placeholder="Any additional notes about this meter..."
                    value={formData.remarks}
                    onChange={(e) => handleChange('remarks', e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Activate meter immediately
                  </label>
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
              ) : null}

              <Button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? (isEdit ? 'Saving Changes...' : 'Creating Meter...') : (isEdit ? 'Save Changes' : 'Create Meter')}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Add padding to account for fixed footer */}
        <div className="h-20" />
      </form>
    </div>
  );
};

export default MeterFormTabbed;