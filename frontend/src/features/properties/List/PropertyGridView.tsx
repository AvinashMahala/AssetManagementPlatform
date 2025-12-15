import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Receipt, BarChart3, Edit, Trash2 } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { PropertyStatus, PropertyType } from '../../../types/property';
import type { Property } from '../../../types/property';

interface PropertyGridViewProps {
  properties: Property[];
  selectedProperties: Set<string>;
  onSelectProperty: (id: string, checked: boolean) => void;
  onDeleteClick: (id: string, name: string) => void;
}

const PropertyGridView: React.FC<PropertyGridViewProps> = ({
  properties,
  selectedProperties,
  onSelectProperty,
  onDeleteClick,
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
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

  const getTypeLabel = (type: string) => {
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

  return (
    <div className="property-grid grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {properties.map((property, index) => (
        <Card key={property.id} className={`property-card hover:shadow-lg transition-all duration-300 relative flex flex-col ${
          property.status === PropertyStatus.AVAILABLE ? 'bg-green-50 dark:bg-green-950/20' : ''
        }`} style={{ '--unit-index': index } as React.CSSProperties}>
          <div className={`property-status-bar h-1 ${getStatusColor(property.status).split(' ')[0]}`}></div>

          {/* Checkbox - Top Right Corner */}
          <div className="absolute top-3 right-3 z-10">
            <input
              type="checkbox"
              className="property-checkbox rounded border-gray-300 w-4 h-4 cursor-pointer"
              checked={selectedProperties.has(property.id)}
              onChange={(e) => onSelectProperty(property.id, e.target.checked)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="property-content px-3 py-2.5 space-y-2 pr-10 flex-1 flex flex-col">
            {/* Row 1: Name & Address */}
            <div>
              <h3 className="property-title text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">{property.name}</h3>
              <div className="property-location flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                <MapPin className="location-icon h-3 w-3 flex-shrink-0" />
                <span className="truncate">{property.address.city}, {property.address.state}</span>
              </div>
            </div>

            {/* Row 2: Type & Status */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="property-type-badge text-xs px-2 py-0.5 flex-shrink-0">
                {getTypeLabel(property.propertyType)}
              </Badge>
              <Badge className={`property-status-badge text-xs px-2 py-0.5 ${getStatusColor(property.status)}`}>
                {property.status.replace('_', ' ')}
              </Badge>
            </div>

            {/* Row 3: Area & Floors (inline) */}
            <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">{property.totalArea ? `${property.totalArea.toLocaleString()}` : 'N/A'}</span> sq ft
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">{property.totalFloors || 'N/A'}</span> floors
              </span>
            </div>

            {/* Row 4: Owner Name & Email (Same Row, Conditional) */}
            {(property.ownerDetails?.name || property.ownerDetails?.emailIds?.[0]) && (
              <div className="flex items-center gap-3 text-xs">
                {property.ownerDetails?.name && (
                  <span className="text-gray-900 dark:text-white font-medium truncate flex-1">
                    {property.ownerDetails.name}
                  </span>
                )}
                {property.ownerDetails?.emailIds?.[0] && (
                  <>
                    {property.ownerDetails?.name && <span className="text-gray-400">•</span>}
                    <span className="text-gray-600 dark:text-gray-400 truncate flex-1">
                      {property.ownerDetails.emailIds[0]}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Row 5: Action Buttons */}
            <div className="property-actions flex items-center gap-1 pt-1 mt-auto">
              <Button
                variant="default"
                size="sm"
                className="action-button rent-button h-7 px-2 bg-green-600 hover:bg-green-700 text-white flex-1"
                onClick={() => navigate(`/properties/${property.id}/rent-collection`)}
                title="Rent Collection"
              >
                <Receipt className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="default"
                size="sm"
                className="action-button dashboard-button h-7 px-2 bg-blue-600 hover:bg-blue-700 text-white flex-1"
                onClick={() => navigate(`/properties/${property.id}/dashboard`)}
                title="View Dashboard"
              >
                <BarChart3 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="action-button edit-button h-7 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex-1"
                onClick={() => navigate(`/properties/${property.id}/edit`)}
                title="Edit Property"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="action-button delete-button h-7 px-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 border-red-300 flex-1"
                onClick={() => onDeleteClick(property.id, property.name)}
                title="Delete Property"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PropertyGridView;