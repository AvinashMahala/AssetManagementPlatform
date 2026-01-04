import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/componentDesignLibrary';
import { Input } from '@/componentDesignLibrary';
import { Textarea } from '@/componentDesignLibrary';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import type { UtilityTypeInput } from '../../types';

interface UtilityTypeFormProps {
  initialData?: Partial<UtilityTypeInput>;
  onSubmit: (data: UtilityTypeInput) => Promise<void>;
  loading?: boolean;
  isEdit?: boolean;
}

export const UtilityTypeForm: React.FC<UtilityTypeFormProps> = ({
  initialData,
  onSubmit,
  loading,
  isEdit = false
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UtilityTypeInput>({
    key: initialData?.key || '',
    name: initialData?.name || '',
    unitOfMeasure: initialData?.unitOfMeasure || '',
    metadata: initialData?.metadata || '{}',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof UtilityTypeInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.key.trim()) newErrors.key = 'Key is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    
    // Validate JSON metadata
    if (formData.metadata) {
      try {
        JSON.parse(formData.metadata);
      } catch (e) {
        newErrors.metadata = 'Invalid JSON format';
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
          <CardTitle>{isEdit ? 'Edit Utility Type' : 'Create Utility Type'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Key *</label>
                  <Input
                    value={formData.key}
                    onChange={(e) => handleChange('key', e.target.value)}
                    placeholder="e.g., electricity"
                    disabled={isEdit} // Key is usually immutable after creation
                    className={errors.key ? 'border-red-500' : ''}
                  />
                  {errors.key && <p className="text-xs text-red-500">{errors.key}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Electricity"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Unit of Measure</label>
                <Input
                  value={formData.unitOfMeasure}
                  onChange={(e) => handleChange('unitOfMeasure', e.target.value)}
                  placeholder="e.g., kWh"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Metadata (JSON)</label>
                <Textarea
                  value={formData.metadata}
                  onChange={(e) => handleChange('metadata', e.target.value)}
                  placeholder="{}"
                  rows={5}
                  className={`font-mono text-sm ${errors.metadata ? 'border-red-500' : ''}`}
                />
                {errors.metadata && <p className="text-xs text-red-500">{errors.metadata}</p>}
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
                    Save Utility Type
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
