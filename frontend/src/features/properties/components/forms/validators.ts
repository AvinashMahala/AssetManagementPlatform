import type { PropertyInput } from '@/types';
import type { FormErrors, TabId } from './types';

export const getTabForField = (fieldName: string): TabId | null => {
  const fieldTabMap: Record<string, TabId> = {
    name: 'basic',
    propertyType: 'basic',
    status: 'basic',
    currency: 'basic',
    ownerId: 'basic',
    street: 'address',
    city: 'address',
    state: 'address',
    pincode: 'address',
    country: 'address',
    landmark: 'address',
    totalArea: 'details',
    totalFloors: 'details',
    yearBuilt: 'details',
    parkingSpaces: 'details',
    ownerMobile: 'owner',
    ownerEmail: 'owner'
  };
  return fieldTabMap[fieldName] || null;
};

export const validateTab = (tabId: TabId, formData: PropertyInput, isEdit: boolean): FormErrors => {
  const newErrors: FormErrors = {};
  switch (tabId) {
    case 'basic':
      if (!formData.name || formData.name.trim().length === 0) newErrors.name = 'Property name is required';
      if (!isEdit && !formData.ownerId) newErrors.ownerId = 'Owner selection is required';
      break;
    case 'address':
      if (!formData.address.street || formData.address.street.trim().length === 0) newErrors.street = 'Street address is required';
      if (!formData.address.city || formData.address.city.trim().length === 0) newErrors.city = 'City is required';
      if (!formData.address.state || formData.address.state.trim().length === 0) newErrors.state = 'State is required';
      if (!formData.address.pincode || formData.address.pincode.trim().length === 0) newErrors.pincode = 'Pincode is required';
      break;
    case 'details':
      if (!formData.totalArea || formData.totalArea <= 0) newErrors.totalArea = 'Valid area is required';
      break;
    case 'owner':
      if (!isEdit && (!formData.ownerDetails.mobileNumbers[0] || formData.ownerDetails.mobileNumbers[0].trim().length === 0)) newErrors.ownerMobile = 'At least one mobile number is required';
      if (!isEdit && (!formData.ownerDetails.emailIds[0] || formData.ownerDetails.emailIds[0].trim().length === 0)) newErrors.ownerEmail = 'At least one email ID is required';
      break;
  }
  return newErrors;
};

export const validateAll = (formData: PropertyInput, isEdit: boolean): FormErrors => {
  const newErrors: FormErrors = {};
  if (!formData.name || formData.name.trim().length === 0) newErrors.name = 'Property name is required';
  if (!formData.address.street || formData.address.street.trim().length === 0) newErrors.street = 'Street address is required';
  if (!formData.address.city || formData.address.city.trim().length === 0) newErrors.city = 'City is required';
  if (!formData.address.state || formData.address.state.trim().length === 0) newErrors.state = 'State is required';
  if (!formData.address.pincode || formData.address.pincode.trim().length === 0) newErrors.pincode = 'Pincode is required';
  if (!formData.totalArea || formData.totalArea <= 0) newErrors.totalArea = 'Valid area is required';
  if (!isEdit && !formData.ownerId) newErrors.ownerId = 'Owner selection is required';
  if (!isEdit && (!formData.ownerDetails.mobileNumbers[0] || formData.ownerDetails.mobileNumbers[0].trim().length === 0)) newErrors.ownerMobile = 'At least one mobile number is required';
  if (!isEdit && (!formData.ownerDetails.emailIds[0] || formData.ownerDetails.emailIds[0].trim().length === 0)) newErrors.ownerEmail = 'At least one email ID is required';

  return newErrors;
};

export const hasTabData = (tabId: TabId, formData: PropertyInput): boolean => {
  switch (tabId) {
    case 'basic':
      return !!(formData.name || formData.description || formData.propertyType || formData.status || formData.ownerId);
    case 'address':
      return !!(formData.address?.street || formData.address?.city || formData.address?.state || formData.address?.pincode);
    case 'details':
      return !!(formData.totalArea || formData.totalFloors || formData.yearBuilt || formData.parkingSpaces || (formData.buildingAmenities && formData.buildingAmenities.length > 0));
    case 'owner':
      return !!(formData.ownerDetails?.name || (formData.ownerDetails?.mobileNumbers && formData.ownerDetails.mobileNumbers.some(m => m)) || (formData.ownerDetails?.emailIds && formData.ownerDetails.emailIds.some(e => e)));
    case 'amenities':
      return !!((formData.amenities?.basic && formData.amenities.basic.length > 0) || (formData.amenities?.luxury && formData.amenities.luxury.length > 0));
    case 'files':
      return !!((formData.buildingPhotos && formData.buildingPhotos.length > 0) || (formData.files && formData.files.length > 0));
    case 'receipt':
      return !!(formData.receiptTemplate?.bankDetails?.bankName || formData.receiptTemplate?.bankDetails?.accountNumber);
    default:
      return false;
  }
};
