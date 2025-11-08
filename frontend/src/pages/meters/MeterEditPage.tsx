import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useMeter, useUpdateMeter, useProperties, useUnits } from '../../hooks';
import { MeterType } from '../../types/meter';
import type { MeterInput } from '../../types/meter';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { AppLayout } from '../../components/layout/AppLayout';

export const MeterEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: meter, loading: loadingMeter, error: meterError } = useMeter(id!);
  const { mutate: updateMeter, loading: updating } = useUpdateMeter();
  const { properties: availableProperties } = useProperties();
  const { units } = useUnits();

  const [formData, setFormData] = useState<Partial<MeterInput>>({
    propertyId: '',
    unitId: '',
    meterType: MeterType.ELECTRICITY,
    meterName: '',
    meterNumber: '',
    remarks: '',
    costPerUnit: 0,
    fixedCharge: 0,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when meter data is loaded
  useEffect(() => {
    if (meter) {
      setFormData({
        propertyId: meter.propertyId,
        unitId: meter.unitId,
        meterType: meter.meterType,
        meterName: meter.meterName,
        meterNumber: meter.meterNumber || '',
        remarks: meter.remarks || '',
        costPerUnit: meter.costPerUnit,
        fixedCharge: meter.fixedCharge || 0,
        isActive: meter.isActive,
      });
    }
  }, [meter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.propertyId) newErrors.propertyId = 'Property is required';
    if (!formData.unitId) newErrors.unitId = 'Unit is required';
    if (!formData.meterName?.trim()) newErrors.meterName = 'Meter name is required';
    if (!formData.meterType) newErrors.meterType = 'Meter type is required';
    if (formData.costPerUnit === undefined || formData.costPerUnit < 0) {
      newErrors.costPerUnit = 'Cost per unit must be a positive number';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      await updateMeter({ id, data: formData as MeterInput });
      navigate('/meters', {
        state: { message: 'Meter updated successfully!' }
      });
    } catch (err) {
      console.error('Failed to update meter:', err);
      alert('Failed to update meter. Please try again.');
    }
  };

  const handleInputChange = (field: keyof MeterInput, value: any) => {
    setFormData((prev: Partial<MeterInput>) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };

  // Filter units by selected property
  const availableUnits = units?.filter((unit: any) => unit.propertyId === formData.propertyId) || [];

  const getMeterTypeDescription = (type: MeterType) => {
    switch (type) {
      case MeterType.ELECTRICITY:
        return 'For electricity consumption tracking';
      case MeterType.WATER:
        return 'For water consumption tracking';
      case MeterType.GAS:
        return 'For gas consumption tracking';
      default:
        return '';
    }
  };

  if (loadingMeter) {
    return (
      <AppLayout title="Edit Meter">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading meter...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (meterError || !meter) {
    return (
      <AppLayout title="Edit Meter">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Meter Not Found</h2>
            <p className="text-gray-600 mb-4">The meter you're trying to edit doesn't exist or has been deleted.</p>
            <Button onClick={() => navigate('/meters')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Meters
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Edit Meter">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/meters')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Meters
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Meter</h1>
            <p className="mt-2 text-gray-600">Update meter configuration and pricing</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meter Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="propertyId">Property *</Label>
                <Select
                  value={formData.propertyId}
                  onValueChange={(value) => handleInputChange('propertyId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProperties.map((property: any) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.propertyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.propertyId && <p className="text-sm text-red-600">{errors.propertyId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitId">Unit *</Label>
                <Select
                  value={formData.unitId}
                  onValueChange={(value) => handleInputChange('unitId', value)}
                  disabled={!formData.propertyId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.propertyId ? "Select a unit" : "Select a property first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUnits.map((unit: any) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.unitNumber} - {unit.unitName || 'Unnamed Unit'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.unitId && <p className="text-sm text-red-600">{errors.unitId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="meterType">Meter Type *</Label>
                <Select
                  value={formData.meterType}
                  onValueChange={(value) => handleInputChange('meterType', value as MeterType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select meter type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(MeterType).map((type: MeterType) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600">{formData.meterType && getMeterTypeDescription(formData.meterType)}</p>
                {errors.meterType && <p className="text-sm text-red-600">{errors.meterType}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="meterName">Meter Name *</Label>
                <Input
                  id="meterName"
                  value={formData.meterName}
                  onChange={(e) => handleInputChange('meterName', e.target.value)}
                  placeholder="e.g., Main Electricity Meter"
                />
                {errors.meterName && <p className="text-sm text-red-600">{errors.meterName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="meterNumber">Meter Number (Optional)</Label>
                <Input
                  id="meterNumber"
                  value={formData.meterNumber}
                  onChange={(e) => handleInputChange('meterNumber', e.target.value)}
                  placeholder="Serial number or meter ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks (Optional)</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  rows={3}
                  placeholder="Additional notes about this meter"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="costPerUnit">Cost per Unit (₹) *</Label>
                <Input
                  id="costPerUnit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPerUnit}
                  onChange={(e) => handleInputChange('costPerUnit', parseFloat(e.target.value) || 0)}
                />
                <p className="text-sm text-gray-600">
                  {formData.meterType === MeterType.ELECTRICITY && 'Cost per kWh (kilowatt-hour)'}
                  {formData.meterType === MeterType.WATER && 'Cost per liter or cubic meter'}
                  {formData.meterType === MeterType.GAS && 'Cost per cubic meter or cubic foot'}
                </p>
                {errors.costPerUnit && <p className="text-sm text-red-600">{errors.costPerUnit}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fixedCharge">Monthly Fixed Charge (₹)</Label>
                <Input
                  id="fixedCharge"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.fixedCharge}
                  onChange={(e) => handleInputChange('fixedCharge', parseFloat(e.target.value) || undefined)}
                />
                <p className="text-sm text-gray-600">Optional monthly fixed charge added to consumption cost</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="isActive" className="text-sm font-normal">
                  Meter is active and can record readings
                </Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/meters')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {updating ? 'Updating...' : 'Update Meter'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};