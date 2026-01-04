import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/componentDesignLibrary';
import { Input } from '@/componentDesignLibrary';
import { Textarea } from '@/componentDesignLibrary';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/componentDesignLibrary';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import { useUtilityTypes } from '@/features/utilityTypes/hooks/useUtilityTypes';
import { useUtilitySubscriptions } from '@/features/utilitySubscriptions/hooks/useUtilitySubscriptions';
import { useMeters } from '@/features/meters/hooks/useMeters';
import type { TariffInput } from '../../types';

interface TariffFormProps {
  initialData?: Partial<TariffInput>;
  onSubmit: (data: TariffInput) => Promise<void>;
  loading?: boolean;
  isEdit?: boolean;
}

export const TariffForm: React.FC<TariffFormProps> = ({
  initialData,
  onSubmit,
  loading,
  isEdit = false
}) => {
  const navigate = useNavigate();
  const { data: utilityTypesResponse } = useUtilityTypes();
  const utilityTypes = utilityTypesResponse?.data || [];
  
  const { data: subscriptionsResponse } = useUtilitySubscriptions();
  const subscriptions = subscriptionsResponse?.data || [];

  const { data: metersResponse } = useMeters();
  const meters = metersResponse?.data || [];

  const [formData, setFormData] = useState<TariffInput>({
    utilityTypeId: initialData?.utilityTypeId || '',
    subscriptionId: initialData?.subscriptionId || undefined,
    meterId: initialData?.meterId || undefined,
    name: initialData?.name || '',
    description: initialData?.description || '',
    effectiveFrom: initialData?.effectiveFrom ? new Date(initialData.effectiveFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    effectiveTo: initialData?.effectiveTo ? new Date(initialData.effectiveTo).toISOString().split('T')[0] : undefined,
    ratePerUnit: initialData?.ratePerUnit || 0,
    fixedCharge: initialData?.fixedCharge || 0,
    tieredRates: initialData?.tieredRates || '[]',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof TariffInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.utilityTypeId) newErrors.utilityTypeId = 'Utility Type is required';
    if (!formData.effectiveFrom) newErrors.effectiveFrom = 'Effective From date is required';
    if (formData.ratePerUnit < 0) newErrors.ratePerUnit = 'Rate per unit must be non-negative';

    // Validate JSON
    if (formData.tieredRates) {
      try {
        JSON.parse(formData.tieredRates);
      } catch (e) {
        newErrors.tieredRates = 'Invalid JSON format';
      }
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
          <CardTitle>{isEdit ? 'Edit Tariff' : 'Create Tariff'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Utility Type *</label>
                <Select
                  value={formData.utilityTypeId}
                  onValueChange={(val) => handleChange('utilityTypeId', val)}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subscription (Optional)</label>
                  <Select
                    value={formData.subscriptionId || 'none'}
                    onValueChange={(val) => handleChange('subscriptionId', val === 'none' ? undefined : val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {subscriptions.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.subscriptionName || sub.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Meter (Optional)</label>
                  <Select
                    value={formData.meterId || 'none'}
                    onValueChange={(val) => handleChange('meterId', val === 'none' ? undefined : val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {meters.map((meter) => (
                        <SelectItem key={meter.id} value={meter.id}>
                          {meter.meterName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Standard Residential Rate"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Effective From *</label>
                  <Input
                    type="date"
                    value={formData.effectiveFrom}
                    onChange={(e) => handleChange('effectiveFrom', e.target.value)}
                    className={errors.effectiveFrom ? 'border-red-500' : ''}
                  />
                  {errors.effectiveFrom && <p className="text-xs text-red-500">{errors.effectiveFrom}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Effective To</label>
                  <Input
                    type="date"
                    value={formData.effectiveTo || ''}
                    onChange={(e) => handleChange('effectiveTo', e.target.value || undefined)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rate Per Unit *</label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={formData.ratePerUnit}
                    onChange={(e) => handleChange('ratePerUnit', parseFloat(e.target.value))}
                    className={errors.ratePerUnit ? 'border-red-500' : ''}
                  />
                  {errors.ratePerUnit && <p className="text-xs text-red-500">{errors.ratePerUnit}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Fixed Charge</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.fixedCharge}
                    onChange={(e) => handleChange('fixedCharge', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tiered Rates (JSON)</label>
                <Textarea
                  value={formData.tieredRates}
                  onChange={(e) => handleChange('tieredRates', e.target.value)}
                  rows={4}
                  className={`font-mono text-sm ${errors.tieredRates ? 'border-red-500' : ''}`}
                  placeholder='[{"threshold": 100, "rate": 1.2}]'
                />
                {errors.tieredRates && <p className="text-xs text-red-500">{errors.tieredRates}</p>}
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
                    Save Tariff
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
