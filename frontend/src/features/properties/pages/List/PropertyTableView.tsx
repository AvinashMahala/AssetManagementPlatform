import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/componentDesignLibrary';
import { Badge } from '@/componentDesignLibrary';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/componentDesignLibrary';
import { PropertyStatus } from '@/features/properties/types';
import type { Property } from '@/features/properties/types';
import { PropertyActions } from '@/features/properties/components/PropertyActions';
import { StatusBadge } from '@/componentDesignLibrary/components/status-badge/StatusBadge';
import type { StatusType } from '@/componentDesignLibrary/components/status-badge/StatusBadge';
import { getTypeLabel } from '../../utils/propertyUtils';

interface PropertyTableViewProps {
  properties: Property[];
  selectedProperties: Set<string>;
  onSelectProperty: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteClick: (id: string, name: string) => void;
}

const PropertyTableView: React.FC<PropertyTableViewProps> = ({
  properties,
  selectedProperties,
  onSelectProperty,
  onSelectAll,
  onDeleteClick,
}) => {
  const navigate = useNavigate();

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
    <div className="property-table-container">
      <Card>
        <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead className="w-12 py-2 px-3">
                    <input
                      type="checkbox"
                      className="header-checkbox rounded border-gray-300"
                      checked={selectedProperties.size === properties.length && properties.length > 0}
                      onChange={(e) => onSelectAll(e.target.checked)}
                    />
                  </TableHead>
                  <TableHead className="w-[25%] min-w-[180px] py-2 px-3">Property Name</TableHead>
                  <TableHead className="w-[12%] min-w-[100px] py-2 px-3">Type</TableHead>
                  <TableHead className="w-[20%] min-w-[150px] py-2 px-3">Location</TableHead>
                  <TableHead className="w-[12%] min-w-[100px] py-2 px-3">Area (sq ft)</TableHead>
                  <TableHead className="w-[12%] min-w-[100px] py-2 px-3">Status</TableHead>
                  <TableHead className="w-[19%] min-w-[180px] py-2 px-3 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <TableRow
                    key={property.id}
                    className={`table-row ${
                      property.status === PropertyStatus.AVAILABLE
                        ? 'bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30'
                        : ''
                    }`}
                  >
                    <TableCell className="py-2 px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="row-checkbox rounded border-gray-300"
                        checked={selectedProperties.has(property.id)}
                        onChange={(e) => onSelectProperty(property.id, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium break-words py-2 px-3">
                      <button
                        className="property-name-link text-blue-600 hover:text-blue-800 hover:underline font-medium text-left"
                        onClick={() => navigate(`/properties/${property.id}/dashboard`)}
                      >
                        {property.name}
                      </button>
                    </TableCell>
                    <TableCell className="break-words py-2 px-3">
                      <Badge variant="outline" className="whitespace-normal text-xs">
                        {getTypeLabel(property.propertyType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="break-words py-2 px-3">
                      <div className="flex items-start gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="break-words text-sm">{property.address.city}, {property.address.state}</span>
                      </div>
                    </TableCell>
                    <TableCell className="break-words py-2 px-3 text-sm">
                      {property.totalArea ? property.totalArea.toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell className="break-words py-2 px-3">
                      <StatusBadge
                        status={mapStatusToBadgeStatus(property.status)}
                        customLabel={property.status.replace('_', ' ')}
                        size="sm"
                        showIcon={false}
                      />
                    </TableCell>
                    <TableCell className="text-right py-2 px-3">
                      <PropertyActions
                        propertyId={property.id}
                        propertyName={property.name}
                        onDelete={onDeleteClick}
                        variant="table"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyTableView;
