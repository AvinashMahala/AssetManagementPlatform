export const AMENITIES = ['Parking', 'Lift', 'Security', 'Gym', 'Power Backup', 'Water Supply', 'Garden', 'Swimming Pool'] as const;

export type TabId = 'basic' | 'address' | 'details' | 'owner' | 'amenities' | 'files' | 'receipt';

export const TABS: Array<{ id: TabId; title: string; description: string; icon: any; required: boolean }> = [
  {
    id: 'basic',
    title: 'Basic Info',
    description: 'Property name, type & owner',
    icon: null,
    required: true
  },
  {
    id: 'address',
    title: 'Address',
    description: 'Location details',
    icon: null,
    required: true
  },
  {
    id: 'details',
    title: 'Property Details',
    description: 'Area, floors & amenities',
    icon: null,
    required: true
  },
  {
    id: 'owner',
    title: 'Owner Contact',
    description: 'Contact information',
    icon: null,
    required: true
  },
  {
    id: 'amenities',
    title: 'Enhanced Amenities',
    description: 'Additional features',
    icon: null,
    required: false
  },
  {
    id: 'files',
    title: 'Photos & Documents',
    description: 'Photos & documents',
    icon: null,
    required: false
  },
  {
    id: 'receipt',
    title: 'Receipt Template',
    description: 'Payment configuration',
    icon: null,
    required: false
  }
];

// Exports for named imports
export default {
  AMENITIES,
  TABS
};
