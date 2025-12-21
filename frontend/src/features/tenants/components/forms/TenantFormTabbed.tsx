import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import navigateBackOrFallback from '@/utils/navigation';
import { User, MapPin, Home, Briefcase, CheckCircle, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { Button } from '@/componentDesignLibrary';
import { Input } from '@/componentDesignLibrary';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/componentDesignLibrary';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/componentDesignLibrary';
import type { TenantInput } from '@/features/tenants/types';

interface TenantFormTabbedProps {
  initialData?: Partial<TenantInput>;
  onSubmit: (data: TenantInput) => Promise<void>;
  loading?: boolean;
  isEdit?: boolean;
  tenantId?: string;
}

// Validation helper functions
const formatPhoneForValidation = (phone: string): string => {
  return phone.replace(/[-\s()]/g, '');
};

const isValidPhone = (phone: string): boolean => {
  if (!phone) return true; // Optional field
  const cleaned = formatPhoneForValidation(phone);
  return /^\+?[1-9]\d{1,14}$/.test(cleaned);
};

const isValidPincode = (pincode: string): boolean => {
  return /^\d{5,6}$/.test(pincode);
};

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const TABS = [
  { id: 'basic', label: 'Basic Info', icon: User, description: 'Personal details and contact' },
  { id: 'current', label: 'Current Address', icon: MapPin, description: 'Residential address' },
  { id: 'permanent', label: 'Permanent Address', icon: Home, description: 'Permanent residence (optional)' },
  { id: 'employment', label: 'Employment', icon: Briefcase, description: 'Work details and emergency contact' }
];

const TenantFormTabbed: React.FC<TenantFormTabbedProps> = ({
  initialData,
  onSubmit,
  loading,
  isEdit = false,
  tenantId
}) => {
  const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState('basic');
  const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set());

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
    permanentAddress: initialData?.permanentAddress ? {
      street: initialData.permanentAddress.street || '',
      city: initialData.permanentAddress.city || '',
      state: initialData.permanentAddress.state || '',
      pincode: initialData.permanentAddress.pincode || '',
    } : undefined,
    emergencyContact: initialData?.emergencyContact ? {
      name: initialData.emergencyContact.name || '',
      relationship: initialData.emergencyContact.relationship || '',
      phone: initialData.emergencyContact.phone || '',
    } : {
      name: '',
      relationship: '',
      phone: '',
    },
    status: initialData?.status || 'active',
  });

  const [showPermanentAddress, setShowPermanentAddress] = useState(
    !!initialData?.permanentAddress
  );

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
        // Validate first name
        if (touched.firstName) {
          if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
          } else if (formData.firstName.length > 100) {
            newErrors.firstName = 'First name must be less than 100 characters';
          }
        }

        // Validate last name
        if (touched.lastName) {
          if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
          } else if (formData.lastName.length > 100) {
            newErrors.lastName = 'Last name must be less than 100 characters';
          }
        }

        // Validate email
        if (touched.email) {
          if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
          } else if (formData.email.length > 255) {
            newErrors.email = 'Email must be less than 255 characters';
          } else if (!isValidEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
          }
        }

        // Validate phone (optional but must be valid if provided)
        if (formData.phone && formData.phone.trim()) {
          if (!isValidPhone(formData.phone)) {
            newErrors.phone = 'Invalid phone format. Use international format (e.g., +1234567890)';
          }
        }

        // Validate alternate phone (optional but must be valid if provided)
        if (formData.alternatePhone && formData.alternatePhone.trim()) {
          if (!isValidPhone(formData.alternatePhone)) {
            newErrors.alternatePhone = 'Invalid phone format. Use international format';
          }
        }

        // Validate monthly income
        if (formData.monthlyIncome !== undefined && formData.monthlyIncome < 0) {
          newErrors.monthlyIncome = 'Monthly income cannot be negative';
        }
        break;

      case 'current':
        // Validate current address (always required)
        if (touched['currentAddress.street']) {
          if (!formData.currentAddress.street.trim()) {
            newErrors['currentAddress.street'] = 'Street address is required';
          } else if (formData.currentAddress.street.length > 255) {
            newErrors['currentAddress.street'] = 'Street address must be less than 255 characters';
          }
        }

        if (touched['currentAddress.city']) {
          if (!formData.currentAddress.city.trim()) {
            newErrors['currentAddress.city'] = 'City is required';
          } else if (formData.currentAddress.city.length > 100) {
            newErrors['currentAddress.city'] = 'City must be less than 100 characters';
          }
        }

        if (touched['currentAddress.state']) {
          if (!formData.currentAddress.state.trim()) {
            newErrors['currentAddress.state'] = 'State is required';
          } else if (formData.currentAddress.state.length > 100) {
            newErrors['currentAddress.state'] = 'State must be less than 100 characters';
          }
        }

        if (touched['currentAddress.pincode']) {
          if (!formData.currentAddress.pincode.trim()) {
            newErrors['currentAddress.pincode'] = 'Pincode is required';
          } else if (!isValidPincode(formData.currentAddress.pincode)) {
            newErrors['currentAddress.pincode'] = 'Pincode must be 5 or 6 digits';
          }
        }
        break;

      case 'permanent':
        // Validate permanent address (optional but must be complete if any field is filled)
        if (showPermanentAddress && formData.permanentAddress) {
          const hasAnyPermanentField =
            formData.permanentAddress.street?.trim() ||
            formData.permanentAddress.city?.trim() ||
            formData.permanentAddress.state?.trim() ||
            formData.permanentAddress.pincode?.trim();

          if (hasAnyPermanentField) {
            if (!formData.permanentAddress.street?.trim()) {
              newErrors['permanentAddress.street'] = 'Street address is required';
            } else if (formData.permanentAddress.street.length > 255) {
              newErrors['permanentAddress.street'] = 'Must be less than 255 characters';
            }

            if (!formData.permanentAddress.city?.trim()) {
              newErrors['permanentAddress.city'] = 'City is required';
            } else if (formData.permanentAddress.city.length > 100) {
              newErrors['permanentAddress.city'] = 'Must be less than 100 characters';
            }

            if (!formData.permanentAddress.state?.trim()) {
              newErrors['permanentAddress.state'] = 'State is required';
            } else if (formData.permanentAddress.state.length > 100) {
              newErrors['permanentAddress.state'] = 'Must be less than 100 characters';
            }

            if (!formData.permanentAddress.pincode?.trim()) {
              newErrors['permanentAddress.pincode'] = 'Pincode is required';
            } else if (!isValidPincode(formData.permanentAddress.pincode)) {
              newErrors['permanentAddress.pincode'] = 'Must be 5 or 6 digits';
            }
          }
        }
        break;

      case 'employment':
        // Validate emergency contact (optional but must be complete if any field is filled)
        const hasAnyEmergencyField =
          formData.emergencyContact?.name?.trim() ||
          formData.emergencyContact?.relationship?.trim() ||
          formData.emergencyContact?.phone?.trim();

        if (hasAnyEmergencyField) {
          if (!formData.emergencyContact?.name?.trim()) {
            newErrors['emergencyContact.name'] = 'Name is required';
          } else if (formData.emergencyContact.name.length > 255) {
            newErrors['emergencyContact.name'] = 'Must be less than 255 characters';
          }

          if (!formData.emergencyContact?.relationship?.trim()) {
            newErrors['emergencyContact.relationship'] = 'Relationship is required';
          } else if (formData.emergencyContact.relationship.length > 100) {
            newErrors['emergencyContact.relationship'] = 'Must be less than 100 characters';
          }

          if (!formData.emergencyContact?.phone?.trim()) {
            newErrors['emergencyContact.phone'] = 'Phone is required';
          } else if (!isValidPhone(formData.emergencyContact.phone)) {
            newErrors['emergencyContact.phone'] = 'Invalid phone format';
          }
        }
        break;
    }

    setErrors(newErrors);
  }, [formData, touched, showPermanentAddress, currentTab]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    markTouched(field);
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent as keyof TenantInput] as any, [field]: value }
    }));
    markTouched(`${parent}.${field}`);
  };

  const validateTab = (tabId: string): boolean => {
    // Trigger validation by marking fields as touched
    const fieldsToTouch: Record<string, string[]> = {
      basic: ['firstName', 'lastName', 'email', 'phone', 'alternatePhone'],
      current: ['currentAddress.street', 'currentAddress.city', 'currentAddress.state', 'currentAddress.pincode'],
      permanent: [], // Handled in useEffect
      employment: [] // Handled in useEffect
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
          fieldsToTouch[tabId]?.some(field => key.includes(field)) ||
          (tabId === 'permanent' && key.includes('permanentAddress')) ||
          (tabId === 'employment' && key.includes('emergencyContact'))
        );
        resolve(tabErrors.length === 0);
      }, 50);
    }) as any;
  };

  const hasTabData = (tabId: string): boolean => {
    switch (tabId) {
      case 'basic':
        return !!(formData.firstName || formData.lastName || formData.email || formData.phone);
      case 'current':
        return !!(formData.currentAddress?.street || formData.currentAddress?.city || formData.currentAddress?.state || formData.currentAddress?.pincode);
      case 'permanent':
        return !!(formData.permanentAddress?.street || formData.permanentAddress?.city || formData.permanentAddress?.state || formData.permanentAddress?.pincode);
      case 'employment':
        return !!(formData.occupation || formData.companyName || formData.monthlyIncome || formData.emergencyContact?.name);
      default:
        return false;
    }
  };

  const handleTabChange = async (tabId: string) => {
    // In edit mode, allow free navigation without validation
    if (isEdit) {
      setCurrentTab(tabId);
    } else {
      // In create mode, validate current tab before allowing navigation
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
          (tab.id === 'basic' && (key === 'firstName' || key === 'lastName' || key === 'email' || key === 'phone' || key === 'alternatePhone')) ||
          (tab.id === 'current' && key.includes('currentAddress')) ||
          (tab.id === 'permanent' && key.includes('permanentAddress')) ||
          (tab.id === 'employment' && key.includes('emergencyContact'))
        );
        if (tabErrors.length > 0) {
          setCurrentTab(tab.id);
          break;
        }
      }
      return;
    }

    // Clean up data before submitting - remove empty emergency contact if not filled
    const dataToSubmit = { ...formData };
    const hasEmergencyContact =
      formData.emergencyContact?.name?.trim() ||
      formData.emergencyContact?.relationship?.trim() ||
      formData.emergencyContact?.phone?.trim();

    if (!hasEmergencyContact) {
      dataToSubmit.emergencyContact = undefined;
    }

    // Remove permanent address if not filled
    if (!showPermanentAddress) {
      dataToSubmit.permanentAddress = undefined;
    }

    await onSubmit(dataToSubmit);
  };

  const handleCancel = () => {
    if (isEdit && tenantId) {
      navigateBackOrFallback(navigate, `/tenants/${tenantId}`);
    } else {
      navigateBackOrFallback(navigate, '/tenants');
    }
  };

  const currentTabIndex = TABS.findIndex(tab => tab.id === currentTab);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === TABS.length - 1;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEdit ? 'Edit Tenant' : 'Create Tenant - Guided Setup'}
        </h1>
        <p className="text-gray-600">
          {isEdit ? 'Update tenant information across different sections.' : 'Complete each section to add a new tenant step by step.'}
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
          <TabsList className="grid w-full grid-cols-4 mb-8">
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
                  <User className="w-5 h-5" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      onBlur={() => markTouched('firstName')}
                      error={errors.firstName}
                      placeholder="Enter first name"
                      className="h-10"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      onBlur={() => markTouched('lastName')}
                      error={errors.lastName}
                      placeholder="Enter last name"
                      className="h-10"
                      maxLength={100}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => markTouched('email')}
                      error={errors.email}
                      placeholder="tenant@example.com"
                      className="h-10"
                      maxLength={255}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      onBlur={() => markTouched('phone')}
                      error={errors.phone}
                      placeholder="+1234567890"
                      className="h-10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alternate Phone
                    </label>
                    <Input
                      value={formData.alternatePhone}
                      onChange={(e) => handleChange('alternatePhone', e.target.value)}
                      onBlur={() => markTouched('alternatePhone')}
                      error={errors.alternatePhone}
                      placeholder="+0987654321"
                      className="h-10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <Input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                      className="h-10"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <Select
                      value={formData.gender || ''}
                      onValueChange={(value) => handleChange('gender', value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select gender (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Current Address Tab */}
          <TabsContent value="current" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Current Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.currentAddress.street}
                      onChange={(e) => handleNestedChange('currentAddress', 'street', e.target.value)}
                      onBlur={() => markTouched('currentAddress.street')}
                      error={errors['currentAddress.street']}
                      placeholder="Building name, street name, area"
                      className="h-10"
                      maxLength={255}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.currentAddress.city}
                      onChange={(e) => handleNestedChange('currentAddress', 'city', e.target.value)}
                      onBlur={() => markTouched('currentAddress.city')}
                      error={errors['currentAddress.city']}
                      placeholder="City name"
                      className="h-10"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.currentAddress.state}
                      onChange={(e) => handleNestedChange('currentAddress', 'state', e.target.value)}
                      onBlur={() => markTouched('currentAddress.state')}
                      error={errors['currentAddress.state']}
                      placeholder="State/Province"
                      className="h-10"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.currentAddress.pincode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        handleNestedChange('currentAddress', 'pincode', value);
                      }}
                      onBlur={() => markTouched('currentAddress.pincode')}
                      error={errors['currentAddress.pincode']}
                      placeholder="12345 or 123456"
                      maxLength={6}
                      className="h-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permanent Address Tab */}
          <TabsContent value="permanent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Home className="w-5 h-5" />
                  <span>Permanent Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2 mb-6">
                  <input
                    type="checkbox"
                    id="showPermanentAddress"
                    checked={showPermanentAddress}
                    onChange={(e) => {
                      setShowPermanentAddress(e.target.checked);
                      if (!e.target.checked) {
                        setFormData(prev => ({ ...prev, permanentAddress: undefined }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          permanentAddress: { street: '', city: '', state: '', pincode: '' }
                        }));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label htmlFor="showPermanentAddress" className="text-sm font-medium">
                    Add permanent address (if different from current)
                  </label>
                </div>

                {showPermanentAddress && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address
                      </label>
                      <Input
                        value={formData.permanentAddress?.street || ''}
                        onChange={(e) => handleNestedChange('permanentAddress', 'street', e.target.value)}
                        error={errors['permanentAddress.street']}
                        placeholder="Building name, street name, area"
                        className="h-10"
                        maxLength={255}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <Input
                        value={formData.permanentAddress?.city || ''}
                        onChange={(e) => handleNestedChange('permanentAddress', 'city', e.target.value)}
                        error={errors['permanentAddress.city']}
                        placeholder="City name"
                        className="h-10"
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <Input
                        value={formData.permanentAddress?.state || ''}
                        onChange={(e) => handleNestedChange('permanentAddress', 'state', e.target.value)}
                        error={errors['permanentAddress.state']}
                        placeholder="State/Province"
                        className="h-10"
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode
                      </label>
                      <Input
                        value={formData.permanentAddress?.pincode || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          handleNestedChange('permanentAddress', 'pincode', value);
                        }}
                        error={errors['permanentAddress.pincode']}
                        placeholder="12345 or 123456"
                        maxLength={6}
                        className="h-10"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employment Tab */}
          <TabsContent value="employment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5" />
                  <span>Employment & Emergency Contact</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Occupation
                    </label>
                    <Input
                      value={formData.occupation}
                      onChange={(e) => handleChange('occupation', e.target.value)}
                      placeholder="Software Engineer, Teacher, etc."
                      className="h-10"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <Input
                      value={formData.companyName}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                      placeholder="Company or organization name"
                      className="h-10"
                      maxLength={255}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Income
                    </label>
                    <Input
                      type="number"
                      value={formData.monthlyIncome ?? ''}
                      onChange={(e) =>
                        handleChange(
                          'monthlyIncome',
                          e.target.value === '' ? undefined : Number(e.target.value)
                        )
                      }
                      error={errors.monthlyIncome}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="border-t pt-6 mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <Input
                        value={formData.emergencyContact?.name || ''}
                        onChange={(e) => handleNestedChange('emergencyContact', 'name', e.target.value)}
                        error={errors['emergencyContact.name']}
                        placeholder="Contact person name"
                        className="h-10"
                        maxLength={255}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relationship
                      </label>
                      <Input
                        value={formData.emergencyContact?.relationship || ''}
                        onChange={(e) => handleNestedChange('emergencyContact', 'relationship', e.target.value)}
                        error={errors['emergencyContact.relationship']}
                        placeholder="Spouse, Parent, Sibling, Friend, etc."
                        className="h-10"
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <Input
                        value={formData.emergencyContact?.phone || ''}
                        onChange={(e) => handleNestedChange('emergencyContact', 'phone', e.target.value)}
                        error={errors['emergencyContact.phone']}
                        placeholder="+1234567890"
                        className="h-10"
                      />
                    </div>
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

              {isEdit && !isLastTab && (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
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
                  <span>{loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Tenant')}</span>
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

export default TenantFormTabbed;