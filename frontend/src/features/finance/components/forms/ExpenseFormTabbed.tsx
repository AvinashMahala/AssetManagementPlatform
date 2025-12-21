import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import navigateBackOrFallback from '@/utils/navigation';
import { FileText, Calendar, Users, Settings, CheckCircle, ArrowLeft, ArrowRight, Save, Upload } from 'lucide-react';
import { Button } from '@/componentDesignLibrary';
import { Input } from '@/componentDesignLibrary';
import { Textarea } from '@/componentDesignLibrary';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/componentDesignLibrary';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/componentDesignLibrary';
import { useProperties } from '@/features/properties/hooks/useProperties';
import { useUnits } from '@/features/units/hooks/useUnits';
import type { ExpenseInput, ExpenseTypeValue, ExpenseFrequencyValue, ExpenseDistributionValue, ExpenseStatusValue } from '@/features/finance/types';
import { ExpenseType, ExpenseFrequency, ExpenseDistribution, ExpenseStatus } from '@/features/finance/types';

interface ExpenseFormTabbedProps {
  initialData?: Partial<ExpenseInput>;
  onSubmit: (data: ExpenseInput) => Promise<void>;
  loading?: boolean;
  isEdit?: boolean;
}

const TABS = [
  { id: 'basic', label: 'Basic Info', icon: FileText, description: 'Property, type & amount' },
  { id: 'schedule', label: 'Schedule', icon: Calendar, description: 'Frequency & dates' },
  { id: 'distribution', label: 'Distribution', icon: Users, description: 'How costs are shared' },
  { id: 'details', label: 'Additional Details', icon: Settings, description: 'Photos & settings' }
];

const ExpenseFormTabbed: React.FC<ExpenseFormTabbedProps> = ({
  initialData,
  onSubmit,
  loading,
  isEdit = false
}) => {
  const navigate = useNavigate();
  const { properties } = useProperties();
  const { units } = useUnits();

  const [currentTab, setCurrentTab] = useState('basic');
  const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<ExpenseInput>({
    propertyId: initialData?.propertyId || '',
    unitId: initialData?.unitId || '',
    type: initialData?.type || ExpenseType.WIFI_INTERNET,
    description: initialData?.description || '',
    amount: initialData?.amount || 0,
    frequency: initialData?.frequency || ExpenseFrequency.MONTHLY,
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    distribution: initialData?.distribution || ExpenseDistribution.OWNER_ONLY,
    affectedUnitIds: initialData?.affectedUnitIds || [],
    billPhotoUrl: initialData?.billPhotoUrl || '',
    status: initialData?.status || ExpenseStatus.ACTIVE,
    createdBy: initialData?.createdBy || 'system', // This should come from auth context
    updatedBy: initialData?.updatedBy
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Mark field as touched
  const markTouched = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Real-time validation effect
  useEffect(() => {
    const newErrors: Record<string, string> = {};

    // Validate based on current tab
    switch (currentTab) {
      case 'basic':
        if (touched.propertyId) {
          if (!formData.propertyId.trim()) {
            newErrors.propertyId = 'Property is required';
          }
        }

        if (touched.type) {
          if (!formData.type) {
            newErrors.type = 'Expense type is required';
          }
        }

        if (touched.description) {
          if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
          }
        }

        if (touched.amount) {
          if (formData.amount <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
          }
        }
        break;

      case 'schedule':
        if (touched.frequency) {
          if (!formData.frequency) {
            newErrors.frequency = 'Frequency is required';
          }
        }

        if (touched.startDate) {
          if (!formData.startDate.trim()) {
            newErrors.startDate = 'Start date is required';
          }
        }
        break;

      case 'distribution':
        if (touched.distribution) {
          if (!formData.distribution) {
            newErrors.distribution = 'Distribution method is required';
          }
        }
        break;
    }

    setErrors(newErrors);
  }, [formData, touched, currentTab]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    markTouched(field);
  };

  const handleUnitToggle = (unitId: string) => {
    setFormData(prev => {
      const affectedUnitIds = prev.affectedUnitIds || [];
      const isSelected = affectedUnitIds.includes(unitId);

      if (isSelected) {
        return {
          ...prev,
          affectedUnitIds: affectedUnitIds.filter(id => id !== unitId)
        };
      } else {
        return {
          ...prev,
          affectedUnitIds: [...affectedUnitIds, unitId]
        };
      }
    });
    markTouched('affectedUnitIds');
  };

  const validateTab = (tabId: string): boolean => {
    // Trigger validation by marking fields as touched
    const fieldsToTouch: Record<string, string[]> = {
      basic: ['propertyId', 'type', 'description', 'amount'],
      schedule: ['frequency', 'startDate'],
      distribution: ['distribution'],
      details: []
    };

    const newTouched: Record<string, boolean> = {};
    fieldsToTouch[tabId]?.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(prev => ({ ...prev, ...newTouched }));

    // Wait for validation to complete
    return new Promise(resolve => {
      setTimeout(() => {
        const tabErrors = Object.keys(errors).filter(key =>
          fieldsToTouch[tabId]?.some(field => key.includes(field))
        );
        resolve(tabErrors.length === 0);
      }, 50);
    }) as any;
  };

  const hasTabData = (tabId: string): boolean => {
    switch (tabId) {
      case 'basic':
        return !!(formData.propertyId && formData.type && formData.description && formData.amount > 0);
      case 'schedule':
        return !!(formData.frequency && formData.startDate);
      case 'distribution':
        return !!(formData.distribution);
      case 'details':
        return true; // Details tab is always considered to have data
      default:
        return false;
    }
  };

  const handleTabChange = async (tabId: string) => {
    if (isEdit) {
      // Allow free navigation in edit mode
      setCurrentTab(tabId);
    } else {
      const isValid = await validateTab(currentTab);
      if (isValid) {
        setCompletedTabs(prev => new Set([...prev, currentTab]));
        setCurrentTab(tabId);
      }
    }
  };

  const handleNext = async () => {
    const isValid = await validateTab(currentTab);
    if (isValid) {
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

  const validateAllTabs = async (): Promise<boolean> => {
    let allValid = true;
    for (const tab of TABS) {
      const isValid = await validateTab(tab.id);
      if (!isValid) {
        allValid = false;
      }
    }
    return allValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await validateAllTabs();
    if (!isValid) {
      // Find first tab with errors
      for (const tab of TABS) {
        const tabErrors = Object.keys(errors).filter(key =>
          (tab.id === 'basic' && (key === 'propertyId' || key === 'type' || key === 'description' || key === 'amount')) ||
          (tab.id === 'schedule' && (key === 'frequency' || key === 'startDate')) ||
          (tab.id === 'distribution' && key === 'distribution')
        );
        if (tabErrors.length > 0) {
          setCurrentTab(tab.id);
          break;
        }
      }
      return;
    }

    await onSubmit(formData);
  };

  const handleCancel = () => {
    navigateBackOrFallback(navigate, '/expenses');
  };

  const currentTabIndex = TABS.findIndex(tab => tab.id === currentTab);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === TABS.length - 1;

  // Filter units by selected property
  const propertyUnits = units.filter(unit => unit.propertyId === formData.propertyId);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEdit ? 'Edit Expense' : 'Create Expense - Guided Setup'}
        </h1>
        <p className="text-gray-600">
          {isEdit ? 'Update expense information across different sections.' : 'Complete each section to create an expense record step by step.'}
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {TABS.map((tab, index) => {
            const isCompleted = completedTabs.has(tab.id);
            const isCurrent = tab.id === currentTab;
            const hasData = hasTabData(tab.id);
            const Icon = tab.icon;

            return (
              <React.Fragment key={tab.id}>
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      isCompleted ? 'bg-green-500 border-green-500 text-white' :
                      isCurrent ? 'bg-blue-500 border-blue-500 text-white' :
                      'bg-gray-100 border-gray-300 text-gray-400'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    {isEdit && hasData && !isCompleted && !isCurrent && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
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
                    completedTabs.has(tab.id) ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isCompleted = completedTabs.has(tab.id);
              const hasData = hasTabData(tab.id);
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={`flex items-center space-x-2 relative ${
                    isCompleted ? 'text-green-600' : ''
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {isCompleted && <CheckCircle className="w-3 h-3 text-green-500" />}
                  {isEdit && hasData && !isCompleted && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.propertyId}
                      onValueChange={(value) => handleChange('propertyId', value)}
                      onOpenChange={() => markTouched('propertyId')}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select a property" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map(property => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.propertyId && <p className="text-sm text-red-600 mt-1">{errors.propertyId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit (Optional)
                    </label>
                    <Select
                      value={formData.unitId || ''}
                      onValueChange={(value) => handleChange('unitId', value || undefined)}
                      disabled={!formData.propertyId}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select a unit (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyUnits.map(unit => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.unitNumber} - {unit.unitName || 'Unnamed Unit'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expense Type <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.type || ''}
                      onValueChange={(value) => handleChange('type', value as ExpenseTypeValue)}
                      onOpenChange={() => markTouched('type')}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select expense type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ExpenseType.WIFI_INTERNET}>WiFi/Internet</SelectItem>
                        <SelectItem value={ExpenseType.FOOD_MEALS}>Food/Meals</SelectItem>
                        <SelectItem value={ExpenseType.INVERTER_GENERATOR}>Inverter/Generator</SelectItem>
                        <SelectItem value={ExpenseType.CABLE_DISH}>Cable/Dish</SelectItem>
                        <SelectItem value={ExpenseType.SURVEILLANCE_CAMERAS}>Surveillance Cameras</SelectItem>
                        <SelectItem value={ExpenseType.LAUNDRY}>Laundry</SelectItem>
                        <SelectItem value={ExpenseType.WATER_BILL}>Water Bill</SelectItem>
                        <SelectItem value={ExpenseType.PLUMBING}>Plumbing</SelectItem>
                        <SelectItem value={ExpenseType.WATER_HEATER}>Water Heater</SelectItem>
                        <SelectItem value={ExpenseType.AC_REPAIR}>AC Repair</SelectItem>
                        <SelectItem value={ExpenseType.FURNITURE_REPAIR}>Furniture Repair</SelectItem>
                        <SelectItem value={ExpenseType.CLEANING}>Cleaning</SelectItem>
                        <SelectItem value={ExpenseType.HOUSEKEEPING}>Housekeeping</SelectItem>
                        <SelectItem value={ExpenseType.PAINTING}>Painting</SelectItem>
                        <SelectItem value={ExpenseType.ELECTRICAL_WORK}>Electrical Work</SelectItem>
                        <SelectItem value={ExpenseType.OTHER}>Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => handleChange('amount', Number(e.target.value))}
                      onBlur={() => markTouched('amount')}
                      error={errors.amount}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="h-10"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      onBlur={() => markTouched('description')}
                      error={errors.description}
                      placeholder="Describe the expense..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Schedule & Frequency</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.frequency || ''}
                      onValueChange={(value) => handleChange('frequency', value as ExpenseFrequencyValue)}
                      onOpenChange={() => markTouched('frequency')}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ExpenseFrequency.ONE_TIME}>One Time</SelectItem>
                        <SelectItem value={ExpenseFrequency.MONTHLY}>Monthly</SelectItem>
                        <SelectItem value={ExpenseFrequency.QUARTERLY}>Quarterly</SelectItem>
                        <SelectItem value={ExpenseFrequency.YEARLY}>Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.frequency && <p className="text-sm text-red-600 mt-1">{errors.frequency}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                      onBlur={() => markTouched('startDate')}
                      error={errors.startDate}
                      className="h-10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date (Optional)
                    </label>
                    <Input
                      type="date"
                      value={formData.endDate || ''}
                      onChange={(e) => handleChange('endDate', e.target.value || undefined)}
                      className="h-10"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty for ongoing expenses
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Distribution Tab */}
          <TabsContent value="distribution" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Cost Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distribution Method <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.distribution || ''}
                    onValueChange={(value) => handleChange('distribution', value as ExpenseDistributionValue)}
                    onOpenChange={() => markTouched('distribution')}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="How should costs be distributed?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ExpenseDistribution.OWNER_ONLY}>Owner Only</SelectItem>
                      <SelectItem value={ExpenseDistribution.SPLIT_AMONG_TENANTS}>Split Among All Tenants</SelectItem>
                      <SelectItem value={ExpenseDistribution.SPECIFIC_UNITS}>Specific Units</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.distribution && <p className="text-sm text-red-600 mt-1">{errors.distribution}</p>}
                </div>

                {formData.distribution === ExpenseDistribution.SPECIFIC_UNITS && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Affected Units
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
                      {propertyUnits.map(unit => (
                        <div key={unit.id} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={`unit-${unit.id}`}
                            checked={(formData.affectedUnitIds || []).includes(unit.id)}
                            onChange={() => handleUnitToggle(unit.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`unit-${unit.id}`}
                            className="text-sm font-medium text-gray-700 cursor-pointer"
                          >
                            {unit.unitNumber} - {unit.unitName || 'Unnamed Unit'}
                          </label>
                        </div>
                      ))}
                    </div>
                    {propertyUnits.length === 0 && (
                      <p className="text-sm text-gray-500 italic">
                        No units available for the selected property
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Additional Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Additional Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bill Photo URL
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        value={formData.billPhotoUrl || ''}
                        onChange={(e) => handleChange('billPhotoUrl', e.target.value)}
                        placeholder="https://example.com/bill.jpg"
                        className="h-10"
                      />
                      <Button type="button" variant="outline" size="sm" className="flex items-center space-x-2">
                        <Upload className="w-4 h-4" />
                        <span>Upload</span>
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Optional: Upload or link to bill receipt
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <Select
                      value={formData.status || ExpenseStatus.ACTIVE}
                      onValueChange={(value) => handleChange('status', value as ExpenseStatusValue)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ExpenseStatus.ACTIVE}>Active</SelectItem>
                        <SelectItem value={ExpenseStatus.INACTIVE}>Inactive</SelectItem>
                        <SelectItem value={ExpenseStatus.ARCHIVED}>Archived</SelectItem>
                      </SelectContent>
                    </Select>
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
                <span>{loading ? (isEdit ? 'Saving Changes...' : 'Creating Expense...') : (isEdit ? 'Save Changes' : 'Create Expense')}</span>
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

export default ExpenseFormTabbed;