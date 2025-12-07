import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import navigateBackOrFallback from '../../utils/navigation';
import { Zap, Settings, DollarSign } from 'lucide-react';
import { BaseForm, FormColumn, FormField } from '../../componentDesignLibrary';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useProperties, useUnits, useProperty, useUnit } from '../../hooks';
import { MeterType } from '../../types/meter';
import type { MeterInput } from '../../types/meter';
import { generateMeterName } from '../../utils/helpers';

interface MeterFormModernProps {
  initialData?: Partial<MeterInput>;
  onSubmit: (data: MeterInput) => Promise<void>;
  loading?: boolean;
}

const MeterFormModern: React.FC<MeterFormModernProps> = ({
  initialData,
  onSubmit,
  loading
}) => {
  const navigate = useNavigate();
  const { properties: availableProperties, loading: propertiesLoading } = useProperties();
  const { units: allUnits, loading: unitsLoading } = useUnits();
  const { data: selectedProperty } = useProperty(initialData?.propertyId || '');
  const { data: selectedUnit } = useUnit(initialData?.unitId || '');

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.propertyId && !initialData?.propertyId) newErrors.propertyId = 'Property is required';
    if (!formData.unitId && !initialData?.unitId) newErrors.unitId = 'Unit is required';
    if (!formData.meterName.trim()) newErrors.meterName = 'Meter name is required';
    if (!formData.meterType) newErrors.meterType = 'Meter type is required';
    if (formData.costPerUnit <= 0) newErrors.costPerUnit = 'Cost per unit must be greater than 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData);
  };

  const handleCancel = () => {
    navigateBackOrFallback(navigate, '/meters');
  };

  return (
    <BaseForm
      title="Create Meter"
      subtitle="Configure a utility meter for consumption tracking"
      backLabel="Back to Meters"
      onBack={() => navigateBackOrFallback(navigate, '/meters')}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      loading={loading}
      cancelLabel="Cancel"
      submitLabel="Create Meter"
    >
      <FormColumn
        title="Basic Information"
        description="Essential meter details"
        icon={<Zap className="h-5 w-5" />}
      >
        <FormField label="Property" required>
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
        </FormField>

        <FormField label="Unit" required>
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
        </FormField>

        <FormField label="Meter Type" required>
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
        </FormField>

        <FormField label="Meter Name" required>
          <Input
            type="text"
            placeholder="e.g., Main Electricity Meter, Kitchen Water Meter"
            value={formData.meterName}
            onChange={(e) => handleChange('meterName', e.target.value)}
            className="h-10"
          />
        </FormField>

        <FormField label="Meter Number">
          <Input
            type="text"
            placeholder="Serial number or meter ID"
            value={formData.meterNumber}
            onChange={(e) => handleChange('meterNumber', e.target.value)}
            className="h-10"
          />
        </FormField>
      </FormColumn>

      <FormColumn
        title="Pricing Configuration"
        description="Cost settings for meter readings"
        icon={<DollarSign className="h-5 w-5" />}
      >
        <FormField label="Cost per Unit (₹)" required>
          <Input
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={formData.costPerUnit || ''}
            onChange={(e) => handleChange('costPerUnit', parseFloat(e.target.value) || 0)}
            className="h-10"
          />
        </FormField>

        <FormField label="Monthly Fixed Charge (₹)">
          <Input
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={formData.fixedCharge || ''}
            onChange={(e) => handleChange('fixedCharge', parseFloat(e.target.value) || 0)}
            className="h-10"
          />
        </FormField>
      </FormColumn>

      <FormColumn
        title="Additional Settings"
        description="Optional configuration and notes"
        icon={<Settings className="h-5 w-5" />}
      >
        <FormField label="Remarks">
          <Textarea
            placeholder="Any additional notes about this meter..."
            value={formData.remarks}
            onChange={(e) => handleChange('remarks', e.target.value)}
            rows={3}
          />
        </FormField>

        <FormField label="Status">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="text-sm font-normal">
              Activate meter immediately
            </label>
          </div>
        </FormField>
      </FormColumn>
    </BaseForm>
  );
};

export default MeterFormModern;