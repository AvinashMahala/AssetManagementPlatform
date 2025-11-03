import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { FormField } from '../../components/ui/form-field';
import { useCreateLease, useUnits, useTenants } from '../../hooks';
import type { LeaseInput } from '../../types/lease';

interface LeaseFormModernProps {
  initialData?: Partial<LeaseInput>;
  loading?: boolean;
}

const LeaseFormModern: React.FC<LeaseFormModernProps> = ({
  initialData,
  loading
}) => {
  const navigate = useNavigate();
  const { mutate: createLease } = useCreateLease();
  const { units } = useUnits();
  const { tenants } = useTenants();

  const [formData, setFormData] = useState<LeaseInput>({
    unitId: initialData?.unitId || '',
    tenantId: initialData?.tenantId || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    monthlyRent: initialData?.monthlyRent || 0,
    securityDeposit: initialData?.securityDeposit || 0,
    maintenanceCharges: initialData?.maintenanceCharges || 0,
    rentDueDay: initialData?.rentDueDay || 1,
    terms: initialData?.terms || '',
    specialConditions: initialData?.specialConditions || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof LeaseInput, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.unitId) newErrors.unitId = 'Unit is required';
    if (!formData.tenantId) newErrors.tenantId = 'Tenant is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.monthlyRent <= 0) newErrors.monthlyRent = 'Monthly rent must be greater than 0';
    if (formData.securityDeposit < 0) newErrors.securityDeposit = 'Security deposit cannot be negative';
    if (formData.maintenanceCharges !== undefined && formData.maintenanceCharges < 0) newErrors.maintenanceCharges = 'Maintenance charges cannot be negative';
    if (formData.rentDueDay < 1 || formData.rentDueDay > 31) newErrors.rentDueDay = 'Rent due day must be between 1 and 31';

    // Check if end date is after start date
    if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createLease(formData);
      navigate('/leases');
    } catch (err) {
      console.error('Failed to create lease:', err);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Lease Parties */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lease Parties
            </CardTitle>
            <CardDescription>
              Select the unit and tenant for this lease agreement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Unit" required>
                <Select value={formData.unitId} onValueChange={(value) => handleChange('unitId', value)}>
                  <SelectTrigger>
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
                {errors.unitId && <p className="text-sm text-red-600 mt-1">{errors.unitId}</p>}
              </FormField>

              <FormField label="Tenant" required>
                <Select value={formData.tenantId} onValueChange={(value) => handleChange('tenantId', value)}>
                  <SelectTrigger>
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
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Lease Period */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Lease Period
            </CardTitle>
            <CardDescription>
              Set the start and end dates for the lease
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Start Date" required>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                />
                {errors.startDate && <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>}
              </FormField>

              <FormField label="End Date" required>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                />
                {errors.endDate && <p className="text-sm text-red-600 mt-1">{errors.endDate}</p>}
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Financial Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Terms
            </CardTitle>
            <CardDescription>
              Set the rent, deposits, and payment schedule
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Monthly Rent (₹)" required>
                <Input
                  type="number"
                  value={formData.monthlyRent}
                  onChange={(e) => handleChange('monthlyRent', Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
                {errors.monthlyRent && <p className="text-sm text-red-600 mt-1">{errors.monthlyRent}</p>}
              </FormField>

              <FormField label="Security Deposit (₹)" required>
                <Input
                  type="number"
                  value={formData.securityDeposit}
                  onChange={(e) => handleChange('securityDeposit', Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
                {errors.securityDeposit && <p className="text-sm text-red-600 mt-1">{errors.securityDeposit}</p>}
              </FormField>

              <FormField label="Maintenance Charges (₹/month)">
                <Input
                  type="number"
                  value={formData.maintenanceCharges}
                  onChange={(e) => handleChange('maintenanceCharges', Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
                {errors.maintenanceCharges && <p className="text-sm text-red-600 mt-1">{errors.maintenanceCharges}</p>}
              </FormField>
            </div>

            <FormField
              label="Rent Due Day (1-31)"
              required
            >
              <Input
                type="number"
                value={formData.rentDueDay}
                onChange={(e) => handleChange('rentDueDay', Number(e.target.value))}
                min="1"
                max="31"
                className="md:w-1/3"
              />
              <p className="mt-1 text-sm text-gray-500">Day of the month when rent is due</p>
              {errors.rentDueDay && <p className="text-sm text-red-600 mt-1">{errors.rentDueDay}</p>}
            </FormField>
          </CardContent>
        </Card>

        {/* Terms and Conditions */}
        <Card>
          <CardHeader>
            <CardTitle>Terms and Conditions</CardTitle>
            <CardDescription>
              Define the lease terms and any special conditions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Lease Terms">
              <Textarea
                value={formData.terms}
                onChange={(e) => handleChange('terms', e.target.value)}
                placeholder="Standard terms and conditions..."
                rows={4}
              />
            </FormField>

            <FormField label="Special Conditions">
              <Textarea
                value={formData.specialConditions}
                onChange={(e) => handleChange('specialConditions', e.target.value)}
                placeholder="Any special conditions or agreements..."
                rows={3}
              />
            </FormField>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/leases')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Lease'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LeaseFormModern;