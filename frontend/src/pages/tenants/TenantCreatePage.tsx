import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateTenant } from '../../hooks';
import { useNotifications } from '../../contexts';
import TenantFormModern from '../../components/forms/TenantFormModern';
import type { TenantInput } from '../../types/tenant';

const TenantCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: createTenant, loading } = useCreateTenant();
  const { showSuccess, showError } = useNotifications();

  const handleSubmit = async (data: TenantInput) => {
    try {
      // Normalize optional fields to avoid backend type issues
      const payload: TenantInput = {
        ...data,
        dateOfBirth: data.dateOfBirth && data.dateOfBirth !== '' ? data.dateOfBirth : undefined,
        phone: data.phone && data.phone.trim() !== '' ? data.phone.trim() : undefined,
        alternatePhone: data.alternatePhone && data.alternatePhone.trim() !== '' ? data.alternatePhone.trim() : undefined,
        occupation: data.occupation && data.occupation.trim() !== '' ? data.occupation : undefined,
        companyName: data.companyName && data.companyName.trim() !== '' ? data.companyName : undefined,
        monthlyIncome: data.monthlyIncome !== undefined && data.monthlyIncome >= 0 ? data.monthlyIncome : undefined,
        // Remove permanentAddress if not provided
        permanentAddress: data.permanentAddress && 
          data.permanentAddress.street && 
          data.permanentAddress.city && 
          data.permanentAddress.state && 
          data.permanentAddress.pincode 
          ? data.permanentAddress 
          : undefined,
        // Remove emergencyContact if not provided
        emergencyContact: data.emergencyContact && 
          data.emergencyContact.name && 
          data.emergencyContact.relationship && 
          data.emergencyContact.phone 
          ? data.emergencyContact 
          : undefined,
        // Enhanced fields
        photoUrl: data.photoUrl && data.photoUrl.trim() !== '' ? data.photoUrl.trim() : undefined,
        numberOfPeople: data.numberOfPeople !== undefined && data.numberOfPeople > 0 ? data.numberOfPeople : undefined,
        moveInDate: data.moveInDate && data.moveInDate !== '' ? data.moveInDate : undefined,
        rentStartDate: data.rentStartDate && data.rentStartDate !== '' ? data.rentStartDate : undefined,
        leaseStartDate: data.leaseStartDate && data.leaseStartDate !== '' ? data.leaseStartDate : undefined,
        leasePeriodMonths: data.leasePeriodMonths !== undefined && data.leasePeriodMonths > 0 ? data.leasePeriodMonths : undefined,
        leaseExpiryDate: data.leaseExpiryDate && data.leaseExpiryDate !== '' ? data.leaseExpiryDate : undefined,
        extraServices: data.extraServices && data.extraServices.length > 0 ? data.extraServices : undefined,
      };

      const response = await createTenant(payload);
      if (response.success && response.data) {
        // Navigate to the created tenant's detail page if id is present, else go back to list
        const newId = (response.data as any).id;
        showSuccess('Tenant created successfully!');
        navigate(newId ? `/tenants/${newId}` : '/tenants');
      } else {
        showError(response.error?.message || 'Failed to create tenant');
      }
    } catch (err) {
      console.error('Create tenant failed', err);
      showError('Failed to create tenant. Please try again.');
    }
  };

  return (
    <TenantFormModern
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
};

export default TenantCreatePage;
