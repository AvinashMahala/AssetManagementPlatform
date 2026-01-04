import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/componentDesignLibrary';
import { Input } from '@/componentDesignLibrary';
import { Textarea } from '@/componentDesignLibrary';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/componentDesignLibrary';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import { useUnits } from '@/features/units/hooks/useUnits';
import { useUtilityTypes } from '@/features/utilityTypes/hooks/useUtilityTypes';
import type { UtilitySubscriptionInput } from '../../types';

interface UtilitySubscriptionFormProps {
  initialData?: Partial<UtilitySubscriptionInput>;
  onSubmit: (data: UtilitySubscriptionInput) => Promise<void>;
  loading?: boolean;
  isEdit?: boolean;
}

export const UtilitySubscriptionForm: React.FC<UtilitySubscriptionFormProps> = ({
  initialData,
  onSubmit,
  loading,
  isEdit = false
}) => {
  const navigate = useNavigate();
  const { units } = useUnits();
  const { data: utilityTypesResponse } = useUtilityTypes();
  const utilityTypes = utilityTypesResponse?.data || [];

  const [formData, setFormData] = useState<UtilitySubscriptionInput>({
    unitId: initialData?.unitId || '',
    utilityTypeId: initialData?.utilityTypeId || '',
    subscriptionName: initialData?.subscriptionName || '',
    isEnabled: initialData?.isEnabled ?? true,
    billingMethod: initialData?.billingMethod || 'fixed',
    fixedAmount: initialData?.fixedAmount || 0,
    billingMultiplier: initialData?.billingMultiplier || 1.0,
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof UtilitySubscriptionInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.unitId) newErrors.unitId = 'Unit is required';
    if (!formData.utilityTypeId) newErrors.utilityTypeId = 'Utility Type is required';
    if (formData.billingMethod === 'fixed' && (formData.fixedAmount === undefined || formData.fixedAmount < 0)) {
      newErrors.fixedAmount = 'Fixed amount is required and must be non-negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="pl-0 hover:pl-2 transition-all"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Utility Subscription' : 'Create Utility Subscription'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit *</label>
                  <Select
                    value={formData.unitId}
                    onValueChange={(val) => handleChange('unitId', val)}
                    disabled={isEdit}
                  >
                    <SelectTrigger className={errors.unitId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units?.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.unitNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.unitId && <p className="text-xs text-red-500">{errors.unitId}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Utility Type *</label>
                  <Select
                    value={formData.utilityTypeId}
                    onValueChange={(val) => handleChange('utilityTypeId', val)}
                    disabled={isEdit}
                  >
                    <SelectTrigger className={errors.utilityTypeId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select Utility Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {utilityTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.utilityTypeId && <p className="text-xs text-red-500">{errors.utilityTypeId}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Subscription Name</label>
                <Input
                  value={formData.subscriptionName}
                  onChange={(e) => handleChange('subscriptionName', e.target.value)}
                  placeholder="e.g., Unit 101 Electricity"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Billing Method *</label>
                  <Select
                    value={formData.billingMethod}
                    onValueChange={(val) => handleChange('billingMethod', val as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="meter_allocated">Meter Allocated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Is Enabled</label>
                  <Select
                    value={formData.isEnabled ? 'true' : 'false'}
                    onValueChange={(val) => handleChange('isEnabled', val === 'true')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.billingMethod === 'fixed' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fixed Amount *</label>
                  <Input
                    type="number"
                    value={formData.fixedAmount}
                    onChange={(e) => handleChange('fixedAmount', parseFloat(e.target.value))}
                    className={errors.fixedAmount ? 'border-red-500' : ''}
                  />
                  {errors.fixedAmount && <p className="text-xs text-red-500">{errors.fixedAmount}</p>}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Billing Multiplier</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.billingMultiplier}
                  onChange={(e) => handleChange('billingMultiplier', parseFloat(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Save className="mr-2 h-4 w-4" />
                    Save Subscription
                  </span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
