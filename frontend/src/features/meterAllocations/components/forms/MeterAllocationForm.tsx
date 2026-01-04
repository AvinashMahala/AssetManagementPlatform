import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/componentDesignLibrary';
import { Input } from '@/componentDesignLibrary';
import { Textarea } from '@/componentDesignLibrary';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/componentDesignLibrary';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import { useMeters } from '@/features/meters/hooks/useMeters';
import { useUtilitySubscriptions } from '@/features/utilitySubscriptions/hooks/useUtilitySubscriptions';
import type { MeterAllocationInput } from '../../types';

interface MeterAllocationFormProps {
  initialData?: Partial<MeterAllocationInput>;
  onSubmit: (data: MeterAllocationInput) => Promise<void>;
  loading?: boolean;
  isEdit?: boolean;
}

export const MeterAllocationForm: React.FC<MeterAllocationFormProps> = ({
  initialData,
  onSubmit,
  loading,
  isEdit = false
}) => {
  const navigate = useNavigate();
  const { data: metersResponse } = useMeters();
  const meters = metersResponse?.data || [];

  const { data: subscriptionsResponse } = useUtilitySubscriptions();
  const subscriptions = subscriptionsResponse?.data || [];

  const [formData, setFormData] = useState<MeterAllocationInput>({
    meterId: initialData?.meterId || '',
    subscriptionId: initialData?.subscriptionId || '',
    allocationFraction: initialData?.allocationFraction || 1.0,
    allocationRule: initialData?.allocationRule || '{}',
    effectiveFrom: initialData?.effectiveFrom ? new Date(initialData.effectiveFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    effectiveTo: initialData?.effectiveTo ? new Date(initialData.effectiveTo).toISOString().split('T')[0] : undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof MeterAllocationInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.meterId) newErrors.meterId = 'Meter is required';
    if (!formData.subscriptionId) newErrors.subscriptionId = 'Subscription is required';
    if (formData.allocationFraction < 0 || formData.allocationFraction > 1) {
      newErrors.allocationFraction = 'Fraction must be between 0 and 1';
    }

    // Validate JSON
    if (formData.allocationRule) {
      try {
        JSON.parse(formData.allocationRule);
      } catch (e) {
        newErrors.allocationRule = 'Invalid JSON format';
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
          <CardTitle>{isEdit ? 'Edit Meter Allocation' : 'Create Meter Allocation'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Meter *</label>
                  <Select
                    value={formData.meterId}
                    onValueChange={(val) => handleChange('meterId', val)}
                  >
                    <SelectTrigger className={errors.meterId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select Meter" />
                    </SelectTrigger>
                    <SelectContent>
                      {meters.map((meter) => (
                        <SelectItem key={meter.id} value={meter.id}>
                          {meter.meterName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.meterId && <p className="text-xs text-red-500">{errors.meterId}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Subscription *</label>
                  <Select
                    value={formData.subscriptionId}
                    onValueChange={(val) => handleChange('subscriptionId', val)}
                  >
                    <SelectTrigger className={errors.subscriptionId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select Subscription" />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptions.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.subscriptionName || sub.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subscriptionId && <p className="text-xs text-red-500">{errors.subscriptionId}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Allocation Fraction (0-1) *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.allocationFraction}
                  onChange={(e) => handleChange('allocationFraction', parseFloat(e.target.value))}
                  className={errors.allocationFraction ? 'border-red-500' : ''}
                />
                {errors.allocationFraction && <p className="text-xs text-red-500">{errors.allocationFraction}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Effective From</label>
                  <Input
                    type="date"
                    value={formData.effectiveFrom || ''}
                    onChange={(e) => handleChange('effectiveFrom', e.target.value || undefined)}
                  />
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Allocation Rule (JSON)</label>
                <Textarea
                  value={formData.allocationRule}
                  onChange={(e) => handleChange('allocationRule', e.target.value)}
                  rows={4}
                  className={`font-mono text-sm ${errors.allocationRule ? 'border-red-500' : ''}`}
                  placeholder="{}"
                />
                {errors.allocationRule && <p className="text-xs text-red-500">{errors.allocationRule}</p>}
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
                    Save Allocation
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
