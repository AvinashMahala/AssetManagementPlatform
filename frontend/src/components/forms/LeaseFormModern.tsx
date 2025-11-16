import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, DollarSign } from 'lucide-react';
import { BaseForm, FormColumn, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, FormField } from '../../componentDesignLibrary';
import { useCreateLease, useUnits, useTenants } from '../../hooks';
import { useNotifications } from '../../contexts';
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
  const { showSuccess, showError } = useNotifications();

  const [formData, setFormData] = useState<LeaseInput>({
    propertyId: initialData?.propertyId || '',
    unitId: initialData?.unitId || '',
    tenantId: initialData?.tenantId || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    monthlyRent: initialData?.monthlyRent || 0,
    securityDeposit: initialData?.securityDeposit || 0,
    maintenanceCharges: initialData?.maintenanceCharges || 0,
    rentDueDay: initialData?.rentDueDay || 1,
    termsConditions: initialData?.termsConditions || '',
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
      showSuccess('Lease created successfully!');
      navigate('/leases');
    } catch (err) {
      console.error('Failed to create lease:', err);
      showError('Failed to create lease. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/leases');
  };

  return (
    <BaseForm
      title="Create Lease"
      backLabel="Back to Leases"
      onBack={() => navigate('/leases')}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      loading={loading}
      cancelLabel="Cancel"
      submitLabel="Create Lease"
    >
      <FormColumn
        title="Lease Parties"
        description="Select unit and tenant"
        icon={<FileText className="h-5 w-5" />}
      >
        <FormField label="Unit" required>
          <Select value={formData.unitId} onValueChange={(value) => handleChange('unitId', value)}>
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
          {errors.unitId && <p className="text-sm text-red-600 mt-1">{errors.unitId}</p>}
        </FormField>

        <FormField label="Tenant" required>
          <Select value={formData.tenantId} onValueChange={(value) => handleChange('tenantId', value)}>
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
        </FormField>
      </FormColumn>

      <FormColumn
        title="Lease Period"
        description="Start and end dates"
        icon={<Calendar className="h-5 w-5" />}
      >
        <FormField label="Start Date" required>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="h-10"
          />
          {errors.startDate && <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>}
        </FormField>

        <FormField label="End Date" required>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="h-10"
          />
          {errors.endDate && <p className="text-sm text-red-600 mt-1">{errors.endDate}</p>}
        </FormField>
      </FormColumn>

      <FormColumn
        title="Financial Terms"
        description="Rent and deposits"
        icon={<DollarSign className="h-5 w-5" />}
      >
        <FormField label="Monthly Rent (₹)" required>
          <Input
            type="number"
            value={formData.monthlyRent}
            onChange={(e) => handleChange('monthlyRent', Number(e.target.value))}
            min="0"
            step="0.01"
            className="h-10"
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
            className="h-10"
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
            className="h-10"
          />
          {errors.maintenanceCharges && <p className="text-sm text-red-600 mt-1">{errors.maintenanceCharges}</p>}
        </FormField>

        <FormField label="Rent Due Day (1-31)" required>
          <Input
            type="number"
            value={formData.rentDueDay}
            onChange={(e) => handleChange('rentDueDay', Number(e.target.value))}
            min="1"
            max="31"
            className="h-10"
          />
          <p className="mt-1 text-sm text-gray-500">Day of the month when rent is due</p>
          {errors.rentDueDay && <p className="text-sm text-red-600 mt-1">{errors.rentDueDay}</p>}
        </FormField>

        <FormField label="Lease Terms">
          <Textarea
            value={formData.termsConditions}
            onChange={(e) => handleChange('termsConditions', e.target.value)}
            placeholder="Standard terms and conditions..."
            rows={3}
            className="resize-none"
          />
        </FormField>

        <FormField label="Special Conditions">
          <Textarea
            value={formData.specialConditions}
            onChange={(e) => handleChange('specialConditions', e.target.value)}
            placeholder="Any special conditions or agreements..."
            rows={3}
            className="resize-none"
          />
        </FormField>
      </FormColumn>
    </BaseForm>
  );
};

export default LeaseFormModern;