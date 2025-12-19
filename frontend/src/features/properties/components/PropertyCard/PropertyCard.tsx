import React from 'react';
import { MapPin } from 'lucide-react';
import { Card } from '@/componentDesignLibrary';
import { Badge } from '@/componentDesignLibrary';
import { StatusBadge } from '../../../../componentDesignLibrary/components/status-badge/StatusBadge';
import type { StatusType } from '../../../../componentDesignLibrary/components/status-badge/StatusBadge';
import { PropertyActions } from '../PropertyActions';
import { getTypeLabel, getStatusColor } from '../../utils/propertyUtils';
import { PropertyStatus } from '../../../../types/property';
import type { PropertyCardProps } from './types';

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isSelected,
  onSelect,
  onDelete,
  index,
  className = ''
}) => {

  const mapStatusToBadgeStatus = (status: string): StatusType => {
    switch (status) {
      case PropertyStatus.AVAILABLE: return 'available';
      case PropertyStatus.OCCUPIED: return 'occupied';
      case PropertyStatus.UNDER_MAINTENANCE: return 'maintenance';
      case PropertyStatus.VACANT: return 'inactive';
      default: return 'inactive';
    }
  };

  return (
    <Card
      className={`property-card hover:shadow-lg transition-all duration-300 relative flex flex-col ${
        property.status === PropertyStatus.AVAILABLE ? 'bg-green-50 dark:bg-green-950/20' : ''
      } ${className}`}
      style={{ '--unit-index': index } as React.CSSProperties}
    >
      <div className={`property-status-bar h-1 ${getStatusColor(property.status).split(' ')[0]}`}></div>

      {/* Checkbox - Top Right Corner */}
      <div className="absolute top-3 right-3 z-10">
        <input
          type="checkbox"
          className="property-checkbox rounded border-gray-300 w-4 h-4 cursor-pointer"
          checked={isSelected}
          onChange={(e) => onSelect(property.id, e.target.checked)}
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
          <StatusBadge
            status={mapStatusToBadgeStatus(property.status)}
            customLabel={property.status.replace('_', ' ')}
            size="sm"
            showIcon={false}
          />
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
        <PropertyActions
          propertyId={property.id}
          propertyName={property.name}
          onDelete={onDelete}
          variant="card"
        />
      </div>
    </Card>
  );
};
