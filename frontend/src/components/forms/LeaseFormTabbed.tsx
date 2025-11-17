import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, Calendar, DollarSign, CheckCircle, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useUnits, useTenants, useUnit, useProperty, useProperties } from '../../hooks';
import type { LeaseInput } from '../../types/lease';

interface LeaseFormTabbedProps {
  initialData?: Partial<LeaseInput>;
  onSubmit: (data: LeaseInput) => Promise<void>;
  loading?: boolean;
  isEdit?: boolean;
}

const TABS = [
  { id: 'parties', label: 'Lease Parties', icon: FileText, description: 'Select unit and tenant' },
  { id: 'period', label: 'Lease Period', icon: Calendar, description: 'Start and end dates' },
  { id: 'financial', label: 'Financial Terms', icon: DollarSign, description: 'Rent and deposits' }
];

const LeaseFormTabbed: React.FC<LeaseFormTabbedProps> = ({
  initialData,
  onSubmit,
  loading,
  isEdit = false
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { units } = useUnits();
  const { tenants } = useTenants();
  const { properties } = useProperties();
  
  // Get contextual data from URL params
  const contextualPropertyId = searchParams.get('propertyId');
  const contextualUnitId = searchParams.get('unitId');
  
  // Fetch unit and property data for contextual creation
  const { data: selectedUnit } = useUnit(contextualUnitId || undefined);
  const { data: selectedProperty } = useProperty(contextualPropertyId || undefined);
  
  // Fetch property and unit data for edit mode
  const { data: editProperty } = useProperty(initialData?.propertyId || undefined);
  const { data: editUnit } = useUnit(initialData?.unitId || undefined);

  const [currentTab, setCurrentTab] = useState('parties');
  const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set());

  // Set default dates: start date = today, end date = 11 months from today
  const getDefaultDates = () => {
    const today = new Date();
    const startDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    const endDate = new Date(today.getFullYear(), today.getMonth() + 11, today.getDate()).toISOString().split('T')[0];
    return { startDate, endDate };
  };

  // Format dates for HTML date inputs (YYYY-MM-DD)
  const formatDateForInput = (dateString: string | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDates();

  const [formData, setFormData] = useState<LeaseInput>({
    propertyId: initialData?.propertyId || contextualPropertyId || '',
    unitId: initialData?.unitId || contextualUnitId || '',
    tenantId: initialData?.tenantId || '',
    startDate: formatDateForInput(initialData?.startDate) || defaultStartDate,
    endDate: formatDateForInput(initialData?.endDate) || defaultEndDate,
    monthlyRent: initialData?.monthlyRent || selectedUnit?.monthlyRent || 0,
    securityDeposit: initialData?.securityDeposit || selectedUnit?.securityDeposit || 0,
    maintenanceCharges: initialData?.maintenanceCharges || selectedUnit?.maintenanceCharges || 0,
    rentDueDay: initialData?.rentDueDay || 1,
    termsConditions: initialData?.termsConditions || '',
    specialConditions: initialData?.specialConditions || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Update form data when unit data is loaded (for contextual creation)
  useEffect(() => {
    if (selectedUnit && contextualUnitId) {
      setFormData(prev => ({
        ...prev,
        propertyId: selectedUnit.propertyId || prev.propertyId,
        monthlyRent: prev.monthlyRent || selectedUnit.monthlyRent || 0,
        securityDeposit: prev.securityDeposit || selectedUnit.securityDeposit || 0,
        maintenanceCharges: prev.maintenanceCharges || selectedUnit.maintenanceCharges || 0,
        // Don't override dates if they were set from initialData
      }));
    }
  }, [selectedUnit, contextualUnitId]);

  // Calculate lease period in years and months
  const calculateLeasePeriod = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) return '';
    
    const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    
    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else if (months === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
    }
  };

  const leasePeriod = calculateLeasePeriod(formData.startDate, formData.endDate);
  const markTouched = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Real-time validation effect
  useEffect(() => {
    const newErrors: Record<string, string> = {};

    // Validate based on current tab
    switch (currentTab) {
      case 'parties':
        if (!contextualPropertyId && touched.propertyId) {
          if (!formData.propertyId.trim()) {
            newErrors.propertyId = 'Property is required';
          }
        }

        if (touched.unitId) {
          if (!formData.unitId.trim()) {
            newErrors.unitId = 'Unit is required';
          }
        }

        if (touched.tenantId) {
          if (!formData.tenantId.trim()) {
            newErrors.tenantId = 'Tenant is required';
          }
        }
        break;

      case 'period':
        if (touched.startDate) {
          if (!formData.startDate.trim()) {
            newErrors.startDate = 'Start date is required';
          }
        }

        if (touched.endDate) {
          if (!formData.endDate.trim()) {
            newErrors.endDate = 'End date is required';
          } else if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
            newErrors.endDate = 'End date must be after start date';
          }
        }
        break;

      case 'financial':
        if (touched.monthlyRent) {
          if (formData.monthlyRent <= 0) {
            newErrors.monthlyRent = 'Monthly rent must be greater than 0';
          }
        }

        if (touched.securityDeposit) {
          if (formData.securityDeposit < 0) {
            newErrors.securityDeposit = 'Security deposit cannot be negative';
          }
        }

        if (touched.maintenanceCharges) {
          if (formData.maintenanceCharges !== undefined && formData.maintenanceCharges < 0) {
            newErrors.maintenanceCharges = 'Maintenance charges cannot be negative';
          }
        }

        if (touched.rentDueDay) {
          if (formData.rentDueDay < 1 || formData.rentDueDay > 31) {
            newErrors.rentDueDay = 'Rent due day must be between 1 and 31';
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

  const validateTab = (tabId: string): boolean => {
    // Trigger validation by marking fields as touched
    const fieldsToTouch: Record<string, string[]> = {
      parties: ['propertyId', 'unitId', 'tenantId'],
      period: ['startDate', 'endDate'],
      financial: ['monthlyRent', 'securityDeposit', 'maintenanceCharges', 'rentDueDay']
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
      case 'parties':
        return !!(formData.propertyId && formData.unitId && formData.tenantId);
      case 'period':
        return !!(formData.startDate && formData.endDate);
      case 'financial':
        return !!(formData.monthlyRent > 0 && formData.securityDeposit >= 0);
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
          (tab.id === 'parties' && (key === 'propertyId' || key === 'unitId' || key === 'tenantId')) ||
          (tab.id === 'period' && (key === 'startDate' || key === 'endDate')) ||
          (tab.id === 'financial' && (key === 'monthlyRent' || key === 'securityDeposit' || key === 'maintenanceCharges' || key === 'rentDueDay'))
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
    navigate('/leases');
  };

  const currentTabIndex = TABS.findIndex(tab => tab.id === currentTab);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === TABS.length - 1;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEdit ? 'Edit Lease Agreement' : 'Create Lease Agreement - Guided Setup'}
        </h1>
        <p className="text-gray-600">
          {isEdit ? 'Update lease information across different sections.' : 'Complete each section to create a comprehensive lease agreement step by step.'}
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
          <TabsList className="grid w-full grid-cols-3 mb-8">
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

          {/* Lease Parties Tab */}
          <TabsContent value="parties" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Lease Parties</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property <span className="text-red-500">*</span>
                    </label>
                    {contextualPropertyId ? (
                      <div className="space-y-2">
                        <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                          <span className="text-sm text-gray-900">
                            {selectedProperty?.name || `Property ${contextualPropertyId}`}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Property is pre-selected from the current context
                        </p>
                      </div>
                    ) : isEdit ? (
                      <div className="space-y-2">
                        <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                          <span className="text-sm text-gray-900">
                            {editProperty?.name || `Property ${initialData?.propertyId}`}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Property cannot be changed when editing a lease
                        </p>
                      </div>
                    ) : (
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
                    )}
                    {errors.propertyId && <p className="text-sm text-red-600 mt-1">{errors.propertyId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit <span className="text-red-500">*</span>
                    </label>
                    {contextualUnitId ? (
                      <div className="space-y-2">
                        <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                          <span className="text-sm text-gray-900">
                            Unit {selectedUnit?.unitNumber || contextualUnitId} - {selectedUnit?.unitType?.toUpperCase() || 'Loading...'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Unit is pre-selected from the current context
                        </p>
                      </div>
                    ) : isEdit ? (
                      <div className="space-y-2">
                        <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                          <span className="text-sm text-gray-900">
                            Unit {editUnit?.unitNumber || initialData?.unitId} - {editUnit?.unitType?.toUpperCase() || 'Loading...'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Unit cannot be changed when editing a lease
                        </p>
                      </div>
                    ) : (
                      <Select
                        value={formData.unitId}
                        onValueChange={(value) => handleChange('unitId', value)}
                        onOpenChange={() => markTouched('unitId')}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map(unit => (
                            <SelectItem key={unit.id} value={unit.id}>
                              Unit {unit.unitNumber} - {unit.unitType.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {errors.unitId && <p className="text-sm text-red-600 mt-1">{errors.unitId}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tenant <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.tenantId}
                      onValueChange={(value) => handleChange('tenantId', value)}
                      onOpenChange={() => markTouched('tenantId')}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select a tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map(tenant => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.firstName} {tenant.lastName} - {tenant.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.tenantId && <p className="text-sm text-red-600 mt-1">{errors.tenantId}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lease Period Tab */}
          <TabsContent value="period" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Lease Period</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    {!contextualUnitId && (
                      <p className="mt-1 text-sm text-gray-500">Defaults to today</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleChange('endDate', e.target.value)}
                      onBlur={() => markTouched('endDate')}
                      error={errors.endDate}
                      className="h-10"
                      min={formData.startDate}
                    />
                    {!contextualUnitId && (
                      <p className="mt-1 text-sm text-gray-500">Defaults to 11 months from start date</p>
                    )}
                  </div>
                </div>

                {/* Lease Period Display */}
                {leasePeriod && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Lease Period</p>
                        <p className="text-lg font-semibold text-blue-700">{leasePeriod}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Terms Tab */}
          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Financial Terms</span>
                </CardTitle>
                {contextualUnitId && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Financial terms are pre-populated from the selected unit and cannot be modified
                  </p>
                )}
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
                      onBlur={() => markTouched('monthlyRent')}
                      error={errors.monthlyRent}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="h-10"
                      disabled={contextualUnitId ? true : false}
                    />
                    {contextualUnitId && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Populated from unit data
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Security Deposit (₹) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={formData.securityDeposit}
                      onChange={(e) => handleChange('securityDeposit', Number(e.target.value))}
                      onBlur={() => markTouched('securityDeposit')}
                      error={errors.securityDeposit}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="h-10"
                      disabled={contextualUnitId ? true : false}
                    />
                    {contextualUnitId && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Populated from unit data
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maintenance Charges (₹/month)
                    </label>
                    <Input
                      type="number"
                      value={formData.maintenanceCharges}
                      onChange={(e) => handleChange('maintenanceCharges', Number(e.target.value))}
                      onBlur={() => markTouched('maintenanceCharges')}
                      error={errors.maintenanceCharges}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="h-10"
                      disabled={contextualUnitId ? true : false}
                    />
                    {contextualUnitId && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Populated from unit data
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rent Due Day (1-31) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={formData.rentDueDay}
                      onChange={(e) => handleChange('rentDueDay', Number(e.target.value))}
                      onBlur={() => markTouched('rentDueDay')}
                      error={errors.rentDueDay}
                      placeholder="1"
                      min="1"
                      max="31"
                      className="h-10"
                    />
                    <p className="mt-1 text-sm text-gray-500">Day of the month when rent is due</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lease Terms
                    </label>
                    <Textarea
                      value={formData.termsConditions}
                      onChange={(e) => handleChange('termsConditions', e.target.value)}
                      placeholder="Standard terms and conditions..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Conditions
                    </label>
                    <Textarea
                      value={formData.specialConditions}
                      onChange={(e) => handleChange('specialConditions', e.target.value)}
                      placeholder="Any special conditions or agreements..."
                      rows={3}
                      className="resize-none"
                    />
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
                <span>{loading ? (isEdit ? 'Saving Changes...' : 'Creating Lease...') : (isEdit ? 'Save Changes' : 'Create Lease')}</span>
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

export default LeaseFormTabbed;