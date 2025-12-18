import { PropertyStatus, PropertyType } from '../../../types/property';

export const getStatusColor = (status: string) => {
  switch (status) {
    case PropertyStatus.AVAILABLE:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case PropertyStatus.OCCUPIED:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case PropertyStatus.UNDER_MAINTENANCE:
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case PropertyStatus.VACANT:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    [PropertyType.APARTMENT]: 'Apartment',
    [PropertyType.HOUSE]: 'House',
    [PropertyType.VILLA]: 'Villa',
    [PropertyType.COMMERCIAL]: 'Commercial',
    [PropertyType.PG_HOSTEL]: 'PG/Hostel',
    [PropertyType.CO_LIVING]: 'Co-Living',
    [PropertyType.OFFICE]: 'Office',
    [PropertyType.SHOP]: 'Shop',
    [PropertyType.WAREHOUSE]: 'Warehouse',
  };
  return labels[type] || type;
};
