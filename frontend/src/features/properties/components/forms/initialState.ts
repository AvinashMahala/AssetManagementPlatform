import type { PropertyInput } from '@/features/properties/types';
import { PropertyType, PropertyStatus } from '@/features/properties/types';
import { DEFAULT_CURRENCY } from '@/types/currency';

export const buildInitialState = (initialData?: Partial<PropertyInput>, isEdit = false, currentUserId?: string): PropertyInput => ({
  name: initialData?.name || '',
  description: initialData?.description || '',
  propertyType: initialData?.propertyType || PropertyType.APARTMENT,
  status: (initialData?.status) ? initialData.status : PropertyStatus.AVAILABLE,
  currency: initialData?.currency || DEFAULT_CURRENCY,
  address: {
    street: initialData?.address?.street || '',
    city: initialData?.address?.city || '',
    state: initialData?.address?.state || '',
    pincode: initialData?.address?.pincode || '',
    country: initialData?.address?.country || 'India',
    landmark: initialData?.address?.landmark || '',
  },
  totalArea: initialData?.totalArea || 0,
  totalFloors: initialData?.totalFloors || undefined,
  yearBuilt: initialData?.yearBuilt || undefined,
  parkingSpaces: initialData?.parkingSpaces || undefined,
  buildingAmenities: initialData?.buildingAmenities || [],
  buildingPhotos: initialData?.buildingPhotos || [],
  ownerDetails: initialData?.ownerDetails ? {
    name: initialData.ownerDetails.name || '',
    mobileNumbers: initialData.ownerDetails.mobileNumbers || [''],
    emailIds: initialData.ownerDetails.emailIds || [''],
    website: initialData.ownerDetails.website || ''
  } : {
    name: '',
    mobileNumbers: [''],
    emailIds: [''],
    website: ''
  },
  amenities: initialData?.amenities || {
    basic: [],
    luxury: [],
    additionalInfo: {
      petFriendly: false,
      smokingAllowed: false,
      eventsAllowed: false
    }
  },
  files: initialData?.files || [],
  receiptTemplate: initialData?.receiptTemplate || {
    bankDetails: {
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      accountHolderName: ''
    },
    wallets: [],
    additionalInfo: {}
  },
  ownerId: initialData?.ownerId || (!isEdit ? currentUserId || '' : ''),
  coOwners: initialData?.coOwners || [],
});
