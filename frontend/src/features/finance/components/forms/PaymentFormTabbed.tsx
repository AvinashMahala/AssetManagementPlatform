import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import navigateBackOrFallback from '@/utils/navigation';
import { CreditCard, Calendar, DollarSign, CheckCircle, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { Button } from '@/componentDesignLibrary';
import { Input } from '@/componentDesignLibrary';
import { Textarea } from '@/componentDesignLibrary';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/componentDesignLibrary';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/componentDesignLibrary';
import { useLeases, useTenants } from '@/hooks';
import type { RentPaymentInput, PaymentMethodValue } from '@/types/payment';
import { PaymentMethod } from '@/types/payment';

interface PaymentFormTabbedProps {
  initialData?: Partial<RentPaymentInput>;
  onSubmit: (data: RentPaymentInput) => Promise<void>;
  loading?: boolean;
  isEdit?: boolean;
}

const TABS = [
  { id: 'details', label: 'Payment Details', icon: CreditCard, description: 'Select lease and tenant' },
  { id: 'amount', label: 'Payment Amount', icon: DollarSign, description: 'Amount and fees' },
  { id: 'information', label: 'Payment Information', icon: Calendar, description: 'Dates and method' }
];

const PaymentFormTabbed: React.FC<PaymentFormTabbedProps> = ({
  initialData,
  onSubmit,
  loading,
  isEdit = false
}) => {
  const navigate = useNavigate();
  const { leases } = useLeases();
  const { tenants } = useTenants();

  const [currentTab, setCurrentTab] = useState('details');
  const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<RentPaymentInput>({
    leaseId: initialData?.leaseId || '',
    tenantId: initialData?.tenantId || '',
    amount: initialData?.amount || 0,
    dueDate: initialData?.dueDate || '',
    paidDate: initialData?.paidDate || '',
    paymentMethod: initialData?.paymentMethod,
    transactionId: initialData?.transactionId || '',
    lateFee: initialData?.lateFee || 0,
    notes: initialData?.notes || '',
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
      case 'details':
        if (touched.leaseId) {
          if (!formData.leaseId.trim()) {
            newErrors.leaseId = 'Lease is required';
          }
        }

        if (touched.tenantId) {
          if (!formData.tenantId.trim()) {
            newErrors.tenantId = 'Tenant is required';
          }
        }
        break;

      case 'amount':
        if (touched.amount) {
          if (formData.amount <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
          }
        }

        if (touched.lateFee) {
          if (formData.lateFee !== undefined && formData.lateFee < 0) {
            newErrors.lateFee = 'Late fee cannot be negative';
          }
        }
        break;

      case 'information':
        if (touched.dueDate) {
          if (!formData.dueDate.trim()) {
            newErrors.dueDate = 'Due date is required';
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
      details: ['leaseId', 'tenantId'],
      amount: ['amount', 'lateFee'],
      information: ['dueDate']
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
      case 'details':
        return !!(formData.leaseId && formData.tenantId);
      case 'amount':
        return !!(formData.amount > 0);
      case 'information':
        return !!(formData.dueDate);
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
          (tab.id === 'details' && (key === 'leaseId' || key === 'tenantId')) ||
          (tab.id === 'amount' && (key === 'amount' || key === 'lateFee')) ||
          (tab.id === 'information' && key === 'dueDate')
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
    navigateBackOrFallback(navigate, '/payments');
  };

  const currentTabIndex = TABS.findIndex(tab => tab.id === currentTab);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === TABS.length - 1;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEdit ? 'Edit Payment' : 'Record Payment - Guided Setup'}
        </h1>
        <p className="text-gray-600">
          {isEdit ? 'Update payment information across different sections.' : 'Complete each section to record a rent payment step by step.'}
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

          {/* Payment Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Payment Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lease <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.leaseId}
                      onValueChange={(value) => handleChange('leaseId', value)}
                      onOpenChange={() => markTouched('leaseId')}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select a lease" />
                      </SelectTrigger>
                      <SelectContent>
                        {leases.map(lease => (
                          <SelectItem key={lease.id} value={lease.id}>
                            Lease {lease.id.substring(0, 8)} - ₹{lease.monthlyRent}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.leaseId && <p className="text-sm text-red-600 mt-1">{errors.leaseId}</p>}
                  </div>

                  <div>
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
                            {tenant.firstName} {tenant.lastName}
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

          {/* Payment Amount Tab */}
          <TabsContent value="amount" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Payment Amount</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Late Fee (₹)
                    </label>
                    <Input
                      type="number"
                      value={formData.lateFee}
                      onChange={(e) => handleChange('lateFee', Number(e.target.value))}
                      onBlur={() => markTouched('lateFee')}
                      error={errors.lateFee}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="h-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Information Tab */}
          <TabsContent value="information" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Payment Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleChange('dueDate', e.target.value)}
                      onBlur={() => markTouched('dueDate')}
                      error={errors.dueDate}
                      className="h-10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paid Date
                    </label>
                    <Input
                      type="date"
                      value={formData.paidDate}
                      onChange={(e) => handleChange('paidDate', e.target.value)}
                      className="h-10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <Select
                      value={formData.paymentMethod || ''}
                      onValueChange={(value) => handleChange('paymentMethod', value as PaymentMethodValue)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                        <SelectItem value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</SelectItem>
                        <SelectItem value={PaymentMethod.UPI}>UPI</SelectItem>
                        <SelectItem value={PaymentMethod.CHEQUE}>Cheque</SelectItem>
                        <SelectItem value={PaymentMethod.CARD}>Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction ID
                    </label>
                    <Input
                      value={formData.transactionId}
                      onChange={(e) => handleChange('transactionId', e.target.value)}
                      placeholder="Enter transaction reference"
                      className="h-10"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      placeholder="Additional notes or comments..."
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
                <span>{loading ? (isEdit ? 'Saving Changes...' : 'Recording Payment...') : (isEdit ? 'Save Changes' : 'Record Payment')}</span>
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

export default PaymentFormTabbed;